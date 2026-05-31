import { useState } from "react";
import { EditorState } from "prosemirror-state";
import { ProseMirror } from "@nytimes/react-prosemirror";
import { react } from "@nytimes/react-prosemirror";
import { editorSchema } from "./schema";
import { createPlugins } from "./plugins";
import "./editor.css";

const initialPlugins = createPlugins();

export default function ProseMirrorEditor() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [editorState, setEditorState] = useState(
    EditorState.create({
      schema: editorSchema,
      plugins: [react(), ...initialPlugins],
    }),
  );

  return (
    <ProseMirror
      mount={mount}
      state={editorState}
      dispatchTransaction={(tr) => {
        setEditorState((prev) => prev.apply(tr));
      }}
    >
      <div ref={setMount} className="prosemirror-mount" />
    </ProseMirror>
  );
}