import type { Node as ProseMirrorNode } from "prosemirror-model";

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

export interface Document {
  chunks: DocumentChunk[];
  cursorPosition?: number;
}

export interface DocumentChunk {
  id: string;
  type: "paragraph" | "heading" | "code_block";
  level?: number;
  content: string;
}

export function extractDocument(
  doc: ProseMirrorNode,
  cursorPos?: number,
): Document {
  const chunks: DocumentChunk[] = [];
  let cursorChunkIndex: number | undefined;

  doc.forEach((child, offset) => {
    if (!BLOCK_TYPES.has(child.type.name)) return;

    const chunk: DocumentChunk = {
      id: `chunk-${chunks.length}`,
      type: child.type.name as DocumentChunk["type"],
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

export function toMarkdown(doc: Document): string {
  return doc.chunks
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

export function toPlaintext(doc: Document): string {
  return doc.chunks
    .map((chunk) => chunk.content)
    .join("\n\n");
}
