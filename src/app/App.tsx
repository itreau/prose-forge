import { useState, useRef, useCallback } from "react";
import type { EditorState } from "prosemirror-state";
import ProseMirrorEditor from "../editor/ProseMirrorEditor";
import { PaperScene } from "../scene";
import SceneOptions from "../scene-options/SceneOptions";
import EditorOptions from "../editor-options/EditorOptions";
import ChatSidebar from "../ai/chat-sidebar";
import ModifyPrompt, { ModifyPreview } from "../ai/modify-prompt";
import { useSceneConfig } from "../hooks/useSceneConfig";
import { useEditorConfig } from "../hooks/useEditorConfig";
import { useModify } from "../ai/use-modify";
import { useKeysmash } from "../ai/use-keysmash";
import { extractAIDocument, toMarkdown } from "../ai/document-adapter";
import { getSelectionTarget } from "../ai/selection-target";
import { applyModification } from "../ai/apply-modification";
import type { EditorView } from "prosemirror-view";

type ActivePanel = "scene" | "editor" | null;

export default function App() {
  const { config, presets, activePreset, loaded, onChange, onSave, onReset, onPresetChange, onDownload: onSceneDownload } = useSceneConfig();
  const { config: editorConfig, editorStyles, onChange: onEditorChange, onSave: onEditorSave, onReset: onEditorReset, onDownload: onEditorDownload } = useEditorConfig(config.pointLight.position);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const editorStateRef = useRef<EditorState | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const { state: modifyState, open: modifyOpen, close: modifyClose, stop: modifyStop, submit: modifySubmit, clearPreview: modifyClearPreview } = useModify();

  const getEditorState = useCallback(() => editorStateRef.current, []);
  const getEditorView = useCallback(() => editorViewRef.current, []);
  const { isGenerating: isKeysmashing, generate: keysmashGenerate } = useKeysmash(getEditorState, getEditorView);

  const handleEditorStateChange = useCallback((state: EditorState) => {
    editorStateRef.current = state;
  }, []);

  const getDocumentContext = useCallback(() => {
    const state = editorStateRef.current;
    if (!state) return "";
    const aiDoc = extractAIDocument(state.doc);
    return toMarkdown(aiDoc);
  }, []);

  const handleModifyToggle = useCallback(() => {
    const state = editorStateRef.current;
    if (!state) return;
    const target = getSelectionTarget(state);
    modifyOpen(target);
  }, [modifyOpen]);

  const handleModifyApply = useCallback(() => {
    const view = editorViewRef.current;
    if (!view || !modifyState.target || !modifyState.buffer) return;
    applyModification(view, modifyState.target.from, modifyState.target.to, modifyState.buffer);
    modifyClearPreview();
  }, [modifyState.target, modifyState.buffer, modifyClearPreview]);

  const handleViewReady = useCallback((view: EditorView | null) => {
    editorViewRef.current = view;
  }, []);

  if (!loaded) return null;

  return (
    <>
      <PaperScene config={config} className="scene-canvas" />
      <div className="editor-overlay" style={chatOpen ? { marginRight: "340px" } : undefined}>
        <ProseMirrorEditor
          onSceneToggle={() => setActivePanel((v) => v === "scene" ? null : "scene")}
          onEditorToggle={() => setActivePanel((v) => v === "editor" ? null : "editor")}
          onChatToggle={() => setChatOpen((v) => !v)}
          onModifyToggle={handleModifyToggle}
          onKeysmash={keysmashGenerate}
          isKeysmashing={isKeysmashing}
          chatOpen={chatOpen}
          onStateChange={handleEditorStateChange}
          onViewReady={handleViewReady}
          editorStyles={editorStyles}
          modifyPreview={
            modifyState.buffer ? (
              <ModifyPreview
                modifyState={modifyState}
                onStop={modifyStop}
                onClearPreview={modifyClearPreview}
                onApply={handleModifyApply}
              />
            ) : null
          }
        />
      </div>
      {chatOpen && (
        <ChatSidebar
          onClose={() => setChatOpen(false)}
          getDocumentContext={getDocumentContext}
        />
      )}
      <ModifyPrompt
        modifyState={modifyState}
        onSubmit={modifySubmit}
        onClose={modifyClose}
      />
      {activePanel === "scene" && (
        <SceneOptions
          config={config}
          presets={presets}
          activePreset={activePreset}
          onChange={onChange}
          onSave={onSave}
          onReset={onReset}
          onPresetChange={onPresetChange}
          onDownload={onSceneDownload}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === "editor" && (
        <EditorOptions
          config={editorConfig}
          onChange={onEditorChange}
          onSave={onEditorSave}
          onReset={onEditorReset}
          onDownload={onEditorDownload}
          onClose={() => setActivePanel(null)}
        />
      )}
    </>
  );
}