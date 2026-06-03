import type { Node as ProseMirrorNode } from "prosemirror-model";
import { Fragment, Slice } from "prosemirror-model";
import type { EditorState, Transaction } from "prosemirror-state";
import { editorSchema } from "../editor/schema";
import type { AIDocument, AIDocumentChunk } from "./types";

const BLOCK_TYPES = new Set(["paragraph", "heading", "code_block"]);

function extractInlineText(node: ProseMirrorNode): string {
  const parts: string[] = [];
  node.forEach((child) => {
    if (child.isText) {
      parts.push(child.text ?? "");
    } else if (child.type.name === "hard_break") {
      parts.push("\n");
    }
  });
  return parts.join("");
}

export function extractAIDocument(
  doc: ProseMirrorNode,
  cursorPos?: number,
): AIDocument {
  const chunks: AIDocumentChunk[] = [];
  let cursorChunkIndex: number | undefined;

  doc.forEach((child, offset) => {
    if (!BLOCK_TYPES.has(child.type.name)) return;

    const chunk: AIDocumentChunk = {
      id: `chunk-${chunks.length}`,
      type: child.type.name as AIDocumentChunk["type"],
      content: extractInlineText(child),
    };

    if (child.type.name === "heading") {
      chunk.level = child.attrs.level as number;
    }

    if (
      cursorPos !== undefined &&
      cursorChunkIndex === undefined &&
      cursorPos >= offset &&
      cursorPos <= offset + child.nodeSize
    ) {
      cursorChunkIndex = chunks.length;
    }

    chunks.push(chunk);
  });

  return { chunks, cursorPosition: cursorChunkIndex };
}

export function toMarkdown(aiDoc: AIDocument): string {
  return aiDoc.chunks
    .map((chunk) => {
      switch (chunk.type) {
        case "heading": {
          const prefix = "#".repeat(chunk.level ?? 1);
          return `${prefix} ${chunk.content}`;
        }
        case "code_block":
          return `\`\`\`\n${chunk.content}\n\`\`\``;
        case "paragraph":
          return chunk.content;
      }
    })
    .join("\n\n");
}

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

function chunkToNode(chunk: AIDocumentChunk): ProseMirrorNode {
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
  aiDoc: AIDocument,
): Transaction {
  const tr = state.tr;
  const newNodes = aiDoc.chunks.map(chunkToNode);
  const newDoc = editorSchema.nodes.doc.create(null, Fragment.from(newNodes));
  tr.replace(0, tr.doc.content.size, new Slice(newDoc.content, 0, 0));
  return tr;
}