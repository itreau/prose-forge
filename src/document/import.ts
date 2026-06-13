import { marked } from "marked";
import type { Token, Tokens } from "marked";
import type { Mark, Node as ProseNode } from "prosemirror-model";
import type { EditorState } from "prosemirror-state";
import { editorSchema } from "../editor/schema";
import { isTauri, tauriPickFile } from "../lib/tauri";

export function editorHasContent(state: EditorState | null): boolean {
  if (!state) return false;
  return state.doc.textContent.trim().length > 0;
}

export async function pickFile(): Promise<{ content: string; name: string } | null> {
  if (isTauri()) return tauriPickFile();

  if ("showOpenFilePicker" in window) {
    try {
      const [handle] = await (window as unknown as { showOpenFilePicker(opts: { types: { description: string; accept: Record<string, string[]> }[]; multiple: boolean }): Promise<FileSystemFileHandle[]> }).showOpenFilePicker({
        types: [{
          description: "Text documents",
          accept: { "text/plain": [".txt", ".md"] },
        }],
        multiple: false,
      });
      const file = await handle.getFile();
      const content = await file.text();
      return { content, name: file.name };
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.md";

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (file) {
        const content = await file.text();
        resolve({ content, name: file.name });
      } else {
        resolve(null);
      }
    });

    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}

export function parseContent(content: string, filename: string): ProseNode {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "md" || ext === "markdown") {
    return parseMarkdown(content);
  }
  return parsePlainText(content);
}

function parsePlainText(text: string): ProseNode {
  if (!text.trim()) {
    return editorSchema.nodes.doc.create(null, editorSchema.nodes.paragraph.create());
  }

  const paragraphs = text.split(/\n\n+/);
  const nodes: ProseNode[] = [];

  for (const para of paragraphs) {
    const inline = buildPlainTextInline(para);
    if (inline.length > 0) {
      nodes.push(editorSchema.nodes.paragraph.create(null, inline));
    }
  }

  if (nodes.length === 0) {
    nodes.push(editorSchema.nodes.paragraph.create());
  }

  return editorSchema.nodes.doc.create(null, nodes);
}

function buildPlainTextInline(text: string): ProseNode[] {
  const lines = text.split("\n");
  const nodes: ProseNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) {
      nodes.push(editorSchema.nodes.hard_break.create());
    }
    if (lines[i]) {
      nodes.push(editorSchema.text(lines[i]));
    }
  }
  return nodes;
}

function parseMarkdown(text: string): ProseNode {
  const tokens = marked.lexer(text, { gfm: true });
  const nodes = blockTokensToNodes(tokens);

  if (nodes.length === 0) {
    nodes.push(editorSchema.nodes.paragraph.create());
  }

  return editorSchema.nodes.doc.create(null, nodes);
}

function blockTokensToNodes(tokens: Token[]): ProseNode[] {
  const nodes: ProseNode[] = [];
  for (const token of tokens) {
    nodes.push(...blockTokenToNodes(token));
  }
  return nodes;
}

function blockTokenToNodes(token: Token): ProseNode[] {
  switch (token.type) {
    case "heading": {
      const heading = token as Tokens.Heading;
      const level = Math.min(heading.depth, 3) as 1 | 2 | 3;
      const inline = parseInlineTokens(heading.tokens, []);
      return [editorSchema.nodes.heading.create({ level }, inline.length > 0 ? inline : undefined)];
    }
    case "paragraph": {
      const para = token as Tokens.Paragraph;
      const inline = parseInlineTokens(para.tokens, []);
      return [editorSchema.nodes.paragraph.create(null, inline.length > 0 ? inline : undefined)];
    }
    case "code": {
      const code = token as Tokens.Code;
      const textNode = editorSchema.text(code.text);
      return [editorSchema.nodes.code_block.create(null, textNode)];
    }
    case "blockquote": {
      return blockTokensToNodes((token as Tokens.Blockquote).tokens);
    }
    case "list": {
      const list = token as Tokens.List;
      const nodes: ProseNode[] = [];
      for (const item of list.items) {
        const filtered = item.tokens.filter(t => t.type !== "checkbox");
        if (filtered.some(t => t.type === "paragraph" || t.type === "code" || t.type === "heading" || t.type === "list" || t.type === "blockquote")) {
          nodes.push(...blockTokensToNodes(filtered));
        } else {
          const inline = parseInlineTokens(filtered, []);
          nodes.push(editorSchema.nodes.paragraph.create(null, inline.length > 0 ? inline : undefined));
        }
      }
      return nodes;
    }
    case "space":
    case "hr":
      return [];
    default: {
      if ("text" in token && typeof token.text === "string" && token.text) {
        return [editorSchema.nodes.paragraph.create(null, editorSchema.text(token.text))];
      }
      if ("tokens" in token && Array.isArray(token.tokens)) {
        return blockTokensToNodes(token.tokens);
      }
      return [];
    }
  }
}

function parseInlineTokens(tokens: Token[], marks: Mark[]): ProseNode[] {
  const nodes: ProseNode[] = [];
  for (const token of tokens) {
    nodes.push(...inlineTokenToNodes(token, marks));
  }
  return nodes;
}

function inlineTokenToNodes(token: Token, marks: Mark[]): ProseNode[] {
  switch (token.type) {
    case "text": {
      const textToken = token as Tokens.Text;
      if (textToken.tokens && textToken.tokens.length > 0) {
        return parseInlineTokens(textToken.tokens, marks);
      }
      return textToNodes(textToken.text, marks);
    }
    case "strong": {
      const newMarks = [...marks, editorSchema.marks.strong.create()];
      return parseInlineTokens((token as Tokens.Strong).tokens, newMarks);
    }
    case "em": {
      const newMarks = [...marks, editorSchema.marks.em.create()];
      return parseInlineTokens((token as Tokens.Em).tokens, newMarks);
    }
    case "del": {
      const newMarks = [...marks, editorSchema.marks.strikethrough.create()];
      return parseInlineTokens((token as Tokens.Del).tokens, newMarks);
    }
    case "codespan": {
      const codeToken = token as Tokens.Codespan;
      const newMarks = [...marks, editorSchema.marks.code.create()];
      return [editorSchema.text(codeToken.text, newMarks)];
    }
    case "link": {
      return parseInlineTokens((token as Tokens.Link).tokens, marks);
    }
    case "image": {
      const img = token as Tokens.Image;
      if (img.text) {
        return textToNodes(img.text, marks);
      }
      return [];
    }
    case "br": {
      return [editorSchema.nodes.hard_break.create()];
    }
    default: {
      if ("text" in token && typeof token.text === "string" && token.text) {
        return textToNodes(token.text, marks);
      }
      if ("tokens" in token && Array.isArray(token.tokens)) {
        return parseInlineTokens(token.tokens, marks);
      }
      return [];
    }
  }
}

function textToNodes(text: string, marks: Mark[]): ProseNode[] {
  const parts = text.split("\n");
  const nodes: ProseNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) {
      nodes.push(editorSchema.nodes.hard_break.create());
    }
    if (parts[i]) {
      nodes.push(editorSchema.text(parts[i], marks.length > 0 ? marks : undefined));
    }
  }
  return nodes;
}