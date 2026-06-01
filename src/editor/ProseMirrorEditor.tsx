import { useState, useRef, useCallback } from "react";
import { EditorState } from "prosemirror-state";
import { ProseMirror, useEditorEventCallback } from "@nytimes/react-prosemirror";
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
}: {
  mountRef: (el: HTMLElement | null) => void;
  onSceneToggle: () => void;
  onEditorToggle: () => void;
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

  return (
    <div ref={editorRef} className="editor-container" onClick={handleDocumentClick}>
      <EditorToolbar onSceneToggle={onSceneToggle} onEditorToggle={onEditorToggle} />
      <div ref={mountRef} className="prosemirror-mount" />
    </div>
  );
}

export default function ProseMirrorEditor({
  onSceneToggle,
  onEditorToggle,
  editorStyles,
}: {
  onSceneToggle: () => void;
  onEditorToggle: () => void;
  editorStyles?: React.CSSProperties;
}) {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [editorState, setEditorState] = useState(
    EditorState.create({
      schema: editorSchema,
      plugins: [react(), ...initialPlugins],
    }),
  );

  return (
    <div style={editorStyles}>
      <ProseMirror
        mount={mount}
        state={editorState}
        dispatchTransaction={(tr) => {
          setEditorState((prev) => prev.apply(tr));
        }}
      >
        <EditorInner mountRef={setMount} onSceneToggle={onSceneToggle} onEditorToggle={onEditorToggle} />
      </ProseMirror>
    </div>
  );
}