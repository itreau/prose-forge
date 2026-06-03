import type { EditorState } from "prosemirror-state";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import { Fragment } from "prosemirror-model";
import { editorSchema } from "../editor/schema";

export interface SelectionTarget {
  from: number;
  to: number;
  text: string;
}

export function getSelectionTarget(state: EditorState): SelectionTarget {
  const { from, to, empty } = state.selection;

  if (!empty) {
    const text = state.doc.textBetween(from, to, "\n");
    return { from, to, text };
  }

  const $pos = state.selection.$from;
  const node = $pos.parent;
  const nodeStart = $pos.pos - $pos.parentOffset;
  const nodeEnd = nodeStart + node.nodeSize;

  const text = node.textContent;
  return { from: nodeStart, to: Math.min(nodeEnd, state.doc.content.size), text };
}

export function parseMarkdownParagraphs(text: string): ProseMirrorNode[] {
  const lines = text.split("\n");
  const nodes: ProseMirrorNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      nodes.push(editorSchema.nodes.heading.create({ level }, editorSchema.text(headingMatch[2])));
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const codeText = codeLines.join("\n");
      nodes.push(editorSchema.nodes.code_block.create(null, editorSchema.text(codeText)));
      continue;
    }

    if (line === "") {
      i++;
      continue;
    }

    const paraTexts = [line];
    i++;
    while (i < lines.length && lines[i] !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```")) {
      paraTexts.push(lines[i]);
      i++;
    }
    const inlineNodes = buildInlineContent(paraTexts.join("\n"));
    nodes.push(
      editorSchema.nodes.paragraph.create(
        null,
        inlineNodes.length > 0 ? Fragment.from(inlineNodes) : undefined,
      ),
    );
  }

  return nodes;
}

function buildInlineContent(text: string): ProseMirrorNode[] {
  const parts = text.split("\n");
  const nodes: ProseMirrorNode[] = [];
  for (let j = 0; j < parts.length; j++) {
    if (parts[j]) {
      nodes.push(editorSchema.text(parts[j]));
    }
    if (j < parts.length - 1) {
      nodes.push(editorSchema.nodes.hard_break.create());
    }
  }
  return nodes;
}