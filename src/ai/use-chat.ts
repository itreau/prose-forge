import { useReducer, useCallback, useEffect, useRef } from "react";
import { Effect, Stream } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { getChatClient } from "./client";
import type { ChatMessage } from "./types";
import { loadPrompt } from "./prompts/loader";
import promptTemplate from "./prompts/chat.txt?raw";

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
}

type ChatAction =
  | { type: "send"; content: string }
  | { type: "startStream" }
  | { type: "appendToken"; token: string }
  | { type: "finishStream" }
  | { type: "setError"; error: string }
  | { type: "clear" };

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "send":
      return {
        ...state,
        messages: [...state.messages, { role: "user", content: action.content }],
        isStreaming: true,
        error: null,
      };
    case "startStream":
      return {
        ...state,
        messages: [...state.messages, { role: "assistant", content: "" }],
      };
    case "appendToken":
      return {
        ...state,
        messages: state.messages.map((msg, i) =>
          i === state.messages.length - 1 && msg.role === "assistant"
            ? { ...msg, content: msg.content + action.token }
            : msg
        ),
      };
    case "finishStream":
      return { ...state, isStreaming: false };
    case "setError":
      return { ...state, isStreaming: false, error: action.error };
    case "clear":
      return initialState;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const messagesRef = useRef(state.messages);
  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  const sendMessage = useCallback((text: string, documentMarkdown: string) => {
    if (state.isStreaming) return;

    const systemContent = loadPrompt(promptTemplate, { document: documentMarkdown });
    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...messagesRef.current,
      { role: "user", content: text },
    ];

    dispatch({ type: "send", content: text });
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

    Effect.runPromise(program);
  }, [state.isStreaming]);

  const clear = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  return { state, sendMessage, clear };
}