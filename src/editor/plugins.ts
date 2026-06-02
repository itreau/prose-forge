import { baseKeymap } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import type { Command, Plugin } from "prosemirror-state";
import { toggleMark, setBlockType } from "prosemirror-commands";
import type { Transaction } from "prosemirror-state";
import { editorSchema } from "./schema";

function toggleBlockType(
  nodeType: typeof editorSchema.nodes.heading | typeof editorSchema.nodes.code_block,
  attrs?: Record<string, unknown>,
): Command {
  const setBlock = setBlockType(nodeType, attrs);

  return (state, dispatch, view) => {
    const { $from } = state.selection;
    const node = $from.parent;

    const isAlreadyActive =
      node.type === nodeType &&
      (!attrs || (node.attrs.level !== undefined && node.attrs.level === attrs.level));

    if (isAlreadyActive) {
      return setBlockType(editorSchema.nodes.paragraph)(state, dispatch as
        | ((tr: Transaction) => void)
        | undefined, view);
    }

    return setBlock(state, dispatch, view);
  };
}

type MarkCommandDef = {
  kind: "mark";
  command: Command;
  label: string;
  icon: string;
  markName: string;
};

type BlockCommandDef = {
  kind: "block";
  command: Command;
  label: string;
  icon: string;
  blockType: string;
};

export type ToolbarCommand = MarkCommandDef | BlockCommandDef;

function markDef(command: Command, label: string, icon: string, markName: string): MarkCommandDef {
  return { kind: "mark", command, label, icon, markName };
}

function blockDef(command: Command, label: string, icon: string, blockType: string): BlockCommandDef {
  return { kind: "block", command, label, icon, blockType };
}

const toggleStrong = toggleMark(editorSchema.marks.strong);
const toggleEm = toggleMark(editorSchema.marks.em);
const toggleStrikethrough = toggleMark(editorSchema.marks.strikethrough);
const toggleCode = toggleMark(editorSchema.marks.code);
const setHeading1 = toggleBlockType(editorSchema.nodes.heading, { level: 1 });
const setHeading2 = toggleBlockType(editorSchema.nodes.heading, { level: 2 });
const setHeading3 = toggleBlockType(editorSchema.nodes.heading, { level: 3 });
const setCodeBlock = toggleBlockType(editorSchema.nodes.code_block);

export const toolbarCommands: ToolbarCommand[] = [
  markDef(toggleStrong, "Bold", "bold", "strong"),
  markDef(toggleEm, "Italic", "italic", "em"),
  markDef(toggleStrikethrough, "Strikethrough", "strikethrough", "strikethrough"),
  markDef(toggleCode, "Code", "code", "code"),
  blockDef(setHeading1, "Heading 1", "heading-1", "heading-1"),
  blockDef(setHeading2, "Heading 2", "heading-2", "heading-2"),
  blockDef(setHeading3, "Heading 3", "heading-3", "heading-3"),
  blockDef(setCodeBlock, "Code Block", "code-2", "code_block"),
];

export function createPlugins(): Plugin[] {
  return [
    history(),
    keymap({
      "Mod-b": toggleStrong,
      "Mod-i": toggleEm,
      "Mod-Shift-s": toggleStrikethrough,
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