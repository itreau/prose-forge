import { Fragment, Slice } from "prosemirror-model";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import { editorSchema } from "../editor/schema";
import type { Document, DocumentChunk } from "../document";

function buildInlineNodes(
  text: string,
  nodeType: string,
): ProseMirrorNode[] {
  if (!text && nodeType !== "code_block") {
    return [];
  }

  if (!text) {
    return [];
  }

  if (nodeType === "code_block") {
    return text ? [editorSchema.text(text)] : [];
  }

  const parts = text.split("\n");
  const nodes: ProseMirrorNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      nodes.push(editorSchema.text(parts[i]));
    }
    if (i < parts.length - 1) {
      nodes.push(editorSchema.nodes.hard_break.create());
    }
  }

  return nodes;
}

function chunkToNode(chunk: DocumentChunk): ProseMirrorNode {
  switch (chunk.type) {
    case "paragraph": {
      const inlineNodes = buildInlineNodes(chunk.content, "paragraph");
      return editorSchema.nodes.paragraph.create(
        null,
        inlineNodes.length > 0 ? Fragment.from(inlineNodes) : undefined,
      );
    }
    case "heading": {
      const inlineNodes = buildInlineNodes(chunk.content, "heading");
      return editorSchema.nodes.heading.create(
        { level: chunk.level ?? 1 },
        inlineNodes.length > 0 ? Fragment.from(inlineNodes) : undefined,
      );
    }
    case "code_block": {
      const inlineNodes = buildInlineNodes(chunk.content, "code_block");
      return editorSchema.nodes.code_block.create(
        null,
        inlineNodes.length > 0 ? Fragment.from(inlineNodes) : undefined,
      );
    }
  }
}

export function createTransaction(
  state: EditorState,
  aiDoc: Document,
): Transaction {
  const tr = state.tr;
  const newNodes = aiDoc.chunks.map(chunkToNode);
  const newDoc = editorSchema.nodes.doc.create(null, Fragment.from(newNodes));
  tr.replace(0, tr.doc.content.size, new Slice(newDoc.content, 0, 0));
  return tr;
}
