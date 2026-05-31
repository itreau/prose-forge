import { baseKeymap } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Plugin } from "prosemirror-state";
import { toggleMark, setBlockType } from "prosemirror-commands";
import { editorSchema } from "./schema";

const toggleStrong = toggleMark(editorSchema.marks.strong);
const toggleEm = toggleMark(editorSchema.marks.em);
const toggleCode = toggleMark(editorSchema.marks.code);
const setHeading1 = setBlockType(editorSchema.nodes.heading, { level: 1 });
const setHeading2 = setBlockType(editorSchema.nodes.heading, { level: 2 });
const setHeading3 = setBlockType(editorSchema.nodes.heading, { level: 3 });
const setCodeBlock = setBlockType(editorSchema.nodes.code_block);

export function createPlugins(): Plugin[] {
  return [
    history(),
    keymap({
      "Mod-b": toggleStrong,
      "Mod-i": toggleEm,
      "Mod-`": toggleCode,
      "Mod-Shift-7": setHeading1,
      "Mod-Shift-8": setHeading2,
      "Mod-Shift-9": setHeading3,
      "Mod-Shift-\\": setCodeBlock,
      "Mod-z": undo,
      "Mod-Shift-z": redo,
      "Mod-y": redo,
    }),
    keymap(baseKeymap),
  ];
}