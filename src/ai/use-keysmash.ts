import { useReducer, useCallback, useRef } from "react";
import { Effect, Stream, Fiber } from "effect";
import type { RuntimeFiber } from "effect/Fiber";
import { FetchHttpClient } from "@effect/platform";
import type { EditorState } from "prosemirror-state";

import { getChatClient } from "./client";
import type { ChatMessage } from "./types";
import { extractDocument, toMarkdown } from "../document";
import { loadPrompt } from "./prompts/loader";
import promptTemplate from "./prompts/keysmash.txt?raw";

export interface KeysmashState {
  isOpen: boolean;
  isStreaming: boolean;
  buffer: string;
  error: string | null;
}

type KeysmashAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "startStream" }
  | { type: "appendToken"; token: string }
  | { type: "finishStream" }
  | { type: "setError"; error: string }
  | { type: "clearPreview" };

const initialKeysmashState: KeysmashState = {
  isOpen: false,
  isStreaming: false,
  buffer: "",
  error: null,
};

function keysmashReducer(state: KeysmashState, action: KeysmashAction): KeysmashState {
  switch (action.type) {
    case "open":
      return { ...initialKeysmashState, isOpen: true };
    case "close":
      return initialKeysmashState;
    case "startStream":
      return { ...state, isStreaming: true, buffer: "", error: null };
    case "appendToken":
      return { ...state, buffer: state.buffer + action.token };
    case "finishStream":
      return { ...state, isStreaming: false };
    case "setError":
      return { ...state, isStreaming: false, error: action.error };
    case "clearPreview":
      return { ...state, buffer: "", error: null, isStreaming: false };
  }
}

type StreamFiber = RuntimeFiber<void, unknown>;

export function useKeysmash(getState: () => EditorState | null) {
  const [state, dispatch] = useReducer(keysmashReducer, initialKeysmashState);
  const fiberRef = useRef<StreamFiber | null>(null);

  const cancelFiber = useCallback(() => {
    if (fiberRef.current) {
      Effect.runPromise(Fiber.interrupt(fiberRef.current)).catch(() => {});
      fiberRef.current = null;
    }
  }, []);

  const open = useCallback(() => {
    dispatch({ type: "open" });
  }, []);

  const close = useCallback(() => {
    cancelFiber();
    dispatch({ type: "close" });
  }, [cancelFiber]);

  const stop = useCallback(() => {
    cancelFiber();
    dispatch({ type: "close" });
  }, [cancelFiber]);

  const submit = useCallback((direction: string) => {
    const editorState = getState();
    if (!editorState || state.isStreaming) return;

    const cursorPos = editorState.selection.from;
    const aiDoc = extractDocument(editorState.doc, cursorPos);
    const documentContext = toMarkdown(aiDoc);

    const directionLine = direction.trim() ? `\n${direction.trim()}\n` : "";
    const systemContent = loadPrompt(promptTemplate, {
      document: documentContext,
      direction: directionLine,
    });

    const userContent = direction.trim()
      ? direction.trim()
      : "Continue writing the next paragraph.";

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ];

    dispatch({ type: "startStream" });

    const client = getChatClient();
    const stream = client.stream(apiMessages);

    const program = Stream.runForEach(stream, (token: string) =>
      Effect.sync(() => dispatch({ type: "appendToken", token })),
    ).pipe(
      Effect.tap(() => Effect.sync(() => dispatch({ type: "finishStream" }))),
      Effect.catchAll((e) =>
        Effect.sync(() => dispatch({ type: "setError", error: e.message })),
      ),
      Effect.provide(FetchHttpClient.layer),
    );

    fiberRef.current = Effect.runFork(program);
  }, [getState, state.isStreaming]);

  const clearPreview = useCallback(() => {
    dispatch({ type: "clearPreview" });
  }, []);

  return { state, open, close, stop, submit, clearPreview };
}