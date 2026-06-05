import type { EditorView } from "prosemirror-view";
import { Fragment } from "prosemirror-model";
import { parseMarkdownParagraphs } from "./selection-target";

export function insertGeneratedText(view: EditorView, text: string): void {
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