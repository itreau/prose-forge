import { useState, useCallback, useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { ProseMirror, useEditorEventCallback, useEditorEffect } from "@nytimes/react-prosemirror";
import { react } from "@nytimes/react-prosemirror";
import { editorSchema } from "./schema";
import { createPlugins } from "./plugins";
import EditorToolbar from "./toolbar/EditorToolbar";
import "./editor.css";

const initialPlugins = createPlugins();

function EditorInner({
  mountRef,
  onSceneToggle,
  onEditorToggle,
  onChatToggle,
  onModifyToggle,
  onKeysmash,
  isKeysmashing,
  chatOpen,
  onViewReady,
}: {
  mountRef: (el: HTMLElement | null) => void;
  onSceneToggle: () => void;
  onEditorToggle: () => void;
  onChatToggle: () => void;
  onModifyToggle: () => void;
  onKeysmash: () => void;
  isKeysmashing: boolean;
  chatOpen: boolean;
  onViewReady?: (view: EditorView | null) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const focusEditor = useEditorEventCallback((view) => {
    view.focus();
  });
  const handleDocumentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === editorRef.current) {
        focusEditor();
      }
    },
    [focusEditor],
  );

  useEditorEffect((view) => {
    onViewReady?.(view);
  }, [onViewReady]);

  return (
    <div ref={editorRef} className="editor-container" onClick={handleDocumentClick}>
      <EditorToolbar onSceneToggle={onSceneToggle} onEditorToggle={onEditorToggle} onChatToggle={onChatToggle} onModifyToggle={onModifyToggle} onKeysmash={onKeysmash} isKeysmashing={isKeysmashing} chatOpen={chatOpen} />
      <div ref={mountRef} className="prosemirror-mount" />
    </div>
  );
}

export default function ProseMirrorEditor({
  onSceneToggle,
  onEditorToggle,
  onChatToggle,
  onModifyToggle,
  onKeysmash,
  isKeysmashing,
  chatOpen,
  editorStyles,
  onStateChange,
  onViewReady,
}: {
  onSceneToggle: () => void;
  onEditorToggle: () => void;
  onChatToggle: () => void;
  onModifyToggle: () => void;
  onKeysmash: () => void;
  isKeysmashing: boolean;
  chatOpen: boolean;
  editorStyles?: React.CSSProperties;
  onStateChange?: (state: EditorState) => void;
  onViewReady?: (view: EditorView | null) => void;
}) {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [editorState, setEditorState] = useState(
    EditorState.create({
      schema: editorSchema,
      plugins: [react(), ...initialPlugins],
    }),
  );

  useEffect(() => {
    onStateChange?.(editorState);
  }, [editorState, onStateChange]);

  return (
    <div style={editorStyles}>
      <ProseMirror
        mount={mount}
        state={editorState}
        dispatchTransaction={(tr) => {
          setEditorState((prev) => prev.apply(tr));
        }}
      >
        <EditorInner
          mountRef={setMount}
          onSceneToggle={onSceneToggle}
          onEditorToggle={onEditorToggle}
          onChatToggle={onChatToggle}
          onModifyToggle={onModifyToggle}
          onKeysmash={onKeysmash}
          isKeysmashing={isKeysmashing}
          chatOpen={chatOpen}
          onViewReady={onViewReady}
        />
      </ProseMirror>
    </div>
  );
}