import type { MarkSpec, NodeSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";

const nodes: Record<string, NodeSpec> = {
  doc: {
    content: "block+",
  },
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM() {
      return ["p", 0];
    },
  },
  heading: {
    attrs: { level: { default: 1, validate: "number" } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [1, 2, 3].map((level) => ({ tag: `h${level}`, attrs: { level } })),
    toDOM(node) {
      return [`h${node.attrs.level}`, 0];
    },
  },
  code_block: {
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{ tag: "pre", preserveWhitespace: "full" as const }],
    toDOM() {
      return ["pre", ["code", 0]];
    },
  },
  text: {
    group: "inline",
  },
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM() {
      return ["br"];
    },
  },
};

const marks: Record<string, MarkSpec> = {
  strong: {
    parseDOM: [
      { tag: "strong" },
      { tag: "b" },
      { style: "font-weight=bold" },
      { style: "font-weight=700" },
    ],
    toDOM() {
      return ["strong", 0];
    },
  },
  em: {
    parseDOM: [
      { tag: "em" },
      { tag: "i" },
      { style: "font-style=italic" },
    ],
    toDOM() {
      return ["em", 0];
    },
  },
  strikethrough: {
    parseDOM: [
      { tag: "s" },
      { tag: "del" },
      { tag: "strike" },
      { style: "text-decoration=line-through" },
    ],
    toDOM() {
      return ["s", 0];
    },
  },
  code: {
    parseDOM: [{ tag: "code" }],
    toDOM() {
      return ["code", 0];
    },
  },
};

export const editorSchema = new Schema({ nodes, marks });