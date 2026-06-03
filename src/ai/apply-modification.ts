import type { EditorView } from "prosemirror-view";
import { Fragment } from "prosemirror-model";
import { parseMarkdownParagraphs } from "./selection-target";

export function applyModification(
  view: EditorView,
  from: number,
  to: number,
  newText: string,
): void {
  const nodes = parseMarkdownParagraphs(newText);
  if (nodes.length === 0) return;

  const tr = view.state.tr;
  tr.replaceWith(from, to, Fragment.from(nodes));
  view.dispatch(tr);
}