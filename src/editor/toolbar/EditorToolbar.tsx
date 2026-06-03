import { useEditorState, useEditorEventCallback } from "@nytimes/react-prosemirror";
import type { Command } from "prosemirror-state";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Code2,
  Settings2,
  Palette,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { editorSchema } from "../schema";
import { toolbarCommands } from "../plugins";
import type { ToolbarCommand } from "../plugins";
import KeysmashButton from "../../ai/keysmash-button";

const ICON_MAP: Record<string, React.ReactNode> = {
  "bold": <Bold className="size-4" />,
  "italic": <Italic className="size-4" />,
  "strikethrough": <Strikethrough className="size-4" />,
  "code": <Code className="size-4" />,
  "heading-1": <Heading1 className="size-4" />,
  "heading-2": <Heading2 className="size-4" />,
  "heading-3": <Heading3 className="size-4" />,
  "code-2": <Code2 className="size-4" />,
};

const SEPARATOR_BEFORE = new Set(["heading-1", "code-2"]);

function useActiveMarks(): Set<string> {
  const state = useEditorState();
  const marks = new Set<string>();

  const { empty } = state.selection;
  if (empty) {
    const storedMarks = state.storedMarks;
    if (storedMarks) {
      for (const m of storedMarks) {
        marks.add(m.type.name);
      }
    }
  } else {
    const fragment = state.selection.content().content;
    for (let i = 0; i < fragment.childCount; i++) {
      const node = fragment.child(i);
      for (const m of node.marks) {
        marks.add(m.type.name);
      }
    }
  }

  return marks;
}

function useActiveBlockType(): string {
  const state = useEditorState();
  const { $from } = state.selection;
  const node = $from.parent;
  if (node.type === editorSchema.nodes.heading) {
    return `heading-${node.attrs.level}`;
  }
  if (node.type === editorSchema.nodes.code_block) {
    return "code_block";
  }
  return "paragraph";
}

function isPressed(cmd: ToolbarCommand, activeMarks: Set<string>, activeBlock: string): boolean {
  if (cmd.kind === "mark") return activeMarks.has(cmd.markName);
  return cmd.blockType === activeBlock;
}

export default function EditorToolbar({ onSceneToggle, onEditorToggle, onChatToggle, onModifyToggle, onKeysmash, isKeysmashing, chatOpen }: { onSceneToggle: () => void; onEditorToggle: () => void; onChatToggle: () => void; onModifyToggle: () => void; onKeysmash: () => void; isKeysmashing: boolean; chatOpen: boolean }) {
  const activeMarks = useActiveMarks();
  const activeBlock = useActiveBlockType();

  return (
    <div className="editor-toolbar flex items-center gap-0.5 border-b border-border pb-2 mb-2 flex-wrap">
      {toolbarCommands.map((cmd) => (
        <ToolbarToggle
          key={cmd.label}
          command={cmd.command}
          label={cmd.label}
          icon={ICON_MAP[cmd.icon]}
          pressed={isPressed(cmd, activeMarks, activeBlock)}
          separatorBefore={SEPARATOR_BEFORE.has(cmd.icon)}
        />
      ))}
      <div className="mx-1 h-4 w-px bg-border" />
      <KeysmashButton isGenerating={isKeysmashing} onClick={onKeysmash} />
      <Toggle
        aria-label="AI Modify"
        pressed={false}
        onPressedChange={onModifyToggle}
        size="sm"
        variant="outline"
      >
        <Pencil className="size-4" />
      </Toggle>
      <Toggle
        aria-label="AI Chat"
        pressed={chatOpen}
        onPressedChange={onChatToggle}
        size="sm"
        variant="outline"
      >
        <MessageSquare className="size-4" />
      </Toggle>
      <Toggle
        aria-label="Scene settings"
        pressed={false}
        onPressedChange={onSceneToggle}
        size="sm"
        variant="outline"
      >
        <Settings2 className="size-4" />
      </Toggle>
      <Toggle
        aria-label="Editor appearance"
        pressed={false}
        onPressedChange={onEditorToggle}
        size="sm"
        variant="outline"
      >
        <Palette className="size-4" />
      </Toggle>
    </div>
  );
}

function ToolbarToggle({
  command,
  label,
  icon,
  pressed,
  separatorBefore,
}: {
  command: Command;
  label: string;
  icon: React.ReactNode;
  pressed: boolean;
  separatorBefore?: boolean;
}) {
  const handlePressedChange = useEditorEventCallback((view) => {
    command(view.state, view.dispatch, view);
  });

  return (
    <>
      {separatorBefore && (
        <div className="mx-1 h-4 w-px bg-border" />
      )}
      <Toggle
        aria-label={label}
        pressed={pressed}
        onPressedChange={handlePressedChange}
        size="sm"
        variant="outline"
      >
        {icon}
      </Toggle>
    </>
  );
}