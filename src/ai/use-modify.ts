import { useReducer, useCallback, useRef } from "react";
import { Effect, Stream, Fiber } from "effect";
import type { RuntimeFiber } from "effect/Fiber";
import { FetchHttpClient } from "@effect/platform";
import { getChatClient } from "./client";
import type { ChatMessage } from "./types";
import type { SelectionTarget } from "./selection-target";
import { loadPrompt } from "./prompts/loader";
import promptTemplate from "./prompts/modify.txt?raw";

export interface ModifyState {
  isOpen: boolean;
  isStreaming: boolean;
  buffer: string;
  error: string | null;
  target: SelectionTarget | null;
}

type ModifyAction =
  | { type: "open"; target: SelectionTarget }
  | { type: "close" }
  | { type: "startStream" }
  | { type: "appendToken"; token: string }
  | { type: "finishStream" }
  | { type: "setError"; error: string }
  | { type: "clearPreview" };

const initialModifyState: ModifyState = {
  isOpen: false,
  isStreaming: false,
  buffer: "",
  error: null,
  target: null,
};

function modifyReducer(state: ModifyState, action: ModifyAction): ModifyState {
  switch (action.type) {
    case "open":
      return {
        ...initialModifyState,
        isOpen: true,
        target: action.target,
      };
    case "close":
      return initialModifyState;
    case "startStream":
      return { ...state, isStreaming: true, buffer: "", error: null };
    case "appendToken":
      return { ...state, buffer: state.buffer + action.token };
    case "finishStream":
      return { ...state, isStreaming: false };
    case "setError":
      return { ...state, isStreaming: false, error: action.error };
    case "clearPreview":
      return initialModifyState;
  }
}

type StreamFiber = RuntimeFiber<void, unknown>;

export function useModify() {
  const [state, dispatch] = useReducer(modifyReducer, initialModifyState);
  const fiberRef = useRef<StreamFiber | null>(null);

  const cancelFiber = useCallback(() => {
    if (fiberRef.current) {
      Effect.runPromise(Fiber.interrupt(fiberRef.current)).catch(() => {});
      fiberRef.current = null;
    }
  }, []);

  const open = useCallback((target: SelectionTarget) => {
    dispatch({ type: "open", target });
  }, []);

  const close = useCallback(() => {
    cancelFiber();
    dispatch({ type: "close" });
  }, [cancelFiber]);

  const stop = useCallback(() => {
    cancelFiber();
    dispatch({ type: "close" });
  }, [cancelFiber]);

  const submit = useCallback((prompt: string) => {
    if (!state.target || state.isStreaming) return;

    const systemContent = loadPrompt(promptTemplate, {
      selection: state.target.text,
      prompt,
    });

    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      { role: "user", content: prompt },
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
  }, [state.target, state.isStreaming]);

  const clearPreview = useCallback(() => {
    dispatch({ type: "clearPreview" });
  }, []);

  return { state, open, close, stop, submit, clearPreview };
}