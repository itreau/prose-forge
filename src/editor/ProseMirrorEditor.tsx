import { useState, useCallback, useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { ProseMirror, useEditorEventCallback, useEditorEffect, useEditorState } from "@nytimes/react-prosemirror";
import { react } from "@nytimes/react-prosemirror";
import { Wrench } from "lucide-react";
import { editorSchema } from "./schema";
import { createPlugins } from "./plugins";
import EditorToolbar from "./toolbar/EditorToolbar";
import "./editor.css";

const initialPlugins = createPlugins();

const HOVER_ZONE_HEIGHT = 120;

function WordCount() {
  const state = useEditorState();
  const text = state.doc.textContent;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  return (
    <div className="editor-word-count">
      {words} words · {chars.toLocaleString()} chars
    </div>
  );
}

function EditorInner({
  mountRef,
  onSceneToggle,
  onEditorToggle,
  onExportToggle,
  onDocumentToggle,
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
  onExportToggle: () => void;
  onDocumentToggle: () => void;
  onChatToggle: () => void;
  onModifyToggle: () => void;
  onKeysmash: () => void;
  isKeysmashing: boolean;
  chatOpen: boolean;
  onViewReady?: (view: EditorView | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorFocused, setEditorFocused] = useState(false);
  const [mouseNearTop, setMouseNearTop] = useState(false);

  const focusEditor = useEditorEventCallback((view) => {
    view.focus();
  });

  const handleDocumentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === containerRef.current) {
        focusEditor();
      }
    },
    [focusEditor],
  );

  useEditorEffect((view) => {
    onViewReady?.(view);
  }, [onViewReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      setMouseNearTop(relativeY >= 0 && relativeY <= HOVER_ZONE_HEIGHT);
    }

    function handleMouseLeave() {
      setMouseNearTop(false);
    }

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const toolbarVisible = !editorFocused || mouseNearTop;

  return (
    <div ref={containerRef} className="editor-container" onClick={handleDocumentClick}>
      <EditorToolbar
        visible={toolbarVisible}
        onSceneToggle={onSceneToggle}
        onEditorToggle={onEditorToggle}
        onExportToggle={onExportToggle}
        onDocumentToggle={onDocumentToggle}
        onChatToggle={onChatToggle}
        onModifyToggle={onModifyToggle}
        onKeysmash={onKeysmash}
        isKeysmashing={isKeysmashing}
        chatOpen={chatOpen}
      />
      <button
        className={`editor-menu-icon ${toolbarVisible ? "editor-menu-icon-hidden" : "editor-menu-icon-visible"}`}
        onClick={() => setMouseNearTop(true)}
        type="button"
        aria-label="Show toolbar"
      >
        <Wrench className="size-4" />
      </button>
      <div
        ref={mountRef}
        className="prosemirror-mount"
        onFocus={() => setEditorFocused(true)}
        onBlur={() => setEditorFocused(false)}
      />
      <WordCount />
    </div>
  );
}

export default function ProseMirrorEditor({
  onSceneToggle,
  onEditorToggle,
  onExportToggle,
  onDocumentToggle,
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
  onExportToggle: () => void;
  onDocumentToggle: () => void;
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
          onExportToggle={onExportToggle}
          onDocumentToggle={onDocumentToggle}
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