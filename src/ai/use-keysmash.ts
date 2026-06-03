import { useState, useCallback, useRef } from "react";
import { Effect } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { Fragment } from "prosemirror-model";
import type { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { getChatClient } from "./client";
import type { ChatMessage } from "./types";
import { extractAIDocument, toMarkdown } from "./document-adapter";
import { parseMarkdownParagraphs } from "./selection-target";
import { loadPrompt } from "./prompts/loader";
import promptTemplate from "./prompts/keysmash.txt?raw";

function insertGeneratedText(view: EditorView, text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;

  const nodes = parseMarkdownParagraphs(trimmed);

  if (nodes.length === 0) {
    const tr = view.state.tr;
    const { from, to, empty } = view.state.selection;
    if (empty) {
      tr.insertText(trimmed, from);
    } else {
      tr.insertText(trimmed, from, to);
    }
    view.dispatch(tr);
    view.focus();
    return;
  }

  const fragment = Fragment.from(nodes);
  const tr = view.state.tr;
  const { from, to, empty } = view.state.selection;

  if (empty) {
    tr.insert(from, fragment);
  } else {
    tr.replaceWith(from, to, fragment);
  }

  view.dispatch(tr);
  view.focus();
}

export function useKeysmash(
  getState: () => EditorState | null,
  getView: () => EditorView | null,
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingRef = useRef(false);

  const generate = useCallback(() => {
    if (generatingRef.current) return;
    const state = getState();
    const view = getView();
    if (!state || !view) return;

    const cursorPos = state.selection.from;
    const aiDoc = extractAIDocument(state.doc, cursorPos);
    const documentContext = toMarkdown(aiDoc);

    const systemContent = loadPrompt(promptTemplate, { document: documentContext });
    const apiMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      { role: "user", content: "Continue writing the next paragraph." },
    ];

    generatingRef.current = true;
    setIsGenerating(true);

    const client = getChatClient();

    const program = client.complete(apiMessages).pipe(
      Effect.tap((responseText) =>
        Effect.sync(() => {
          const currentView = getView();
          if (currentView && responseText.trim()) {
            insertGeneratedText(currentView, responseText);
          }
        }),
      ),
      Effect.catchAll(() => Effect.sync(() => {})),
      Effect.provide(FetchHttpClient.layer),
    );

    Effect.runPromise(program).finally(() => {
      generatingRef.current = false;
      setIsGenerating(false);
    });
  }, [getState, getView]);

  return { isGenerating, generate };
}