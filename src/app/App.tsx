import { useState, useRef, useCallback } from "react";
import type { EditorState } from "prosemirror-state";
import ProseMirrorEditor from "../editor/ProseMirrorEditor";
import { PaperScene } from "../scene";
import SceneOptions from "../scene-options/SceneOptions";
import EditorOptions from "../editor-options/EditorOptions";
import DocumentOptions from "../document-options/DocumentOptions";
import ExportOptions from "../export/ExportOptions";
import ChatSidebar from "../ai/chat-sidebar";
import ModifyPrompt from "../ai/modify-prompt";
import KeysmashPrompt from "../ai/keysmash-prompt";
import { useSceneConfig } from "../hooks/useSceneConfig";
import { useEditorConfig } from "../hooks/useEditorConfig";
import { useDocumentConfig } from "../hooks/useDocumentConfig";
import { computeLightPosition } from "../scene/config";
import { useModify } from "../ai/use-modify";
import { useKeysmash } from "../ai/use-keysmash";
import { extractDocument, toMarkdown } from "../document";
import { getSelectionTarget } from "../ai/selection-target";
import { applyModification } from "../ai/apply-modification";
import { insertGeneratedText } from "../ai/keysmash-insert";
import type { EditorView } from "prosemirror-view";

type ActivePanel = "scene" | "editor" | "document" | "export" | null;

export default function App() {
  const { config, presets, activePreset, loaded, onChange, onSave, onReset, onPresetChange, onDownload: onSceneDownload } = useSceneConfig();
  const lightPosition = computeLightPosition(config.pointLight, config.plane);
  const { config: editorConfig, editorStyles, onChange: onEditorChange, onSave: onEditorSave, onReset: onEditorReset, onDownload: onEditorDownload } = useEditorConfig(lightPosition);
  const { config: documentConfig, onChange: onDocumentChange, onSave: onDocumentSave, onReset: onDocumentReset, onDownload: onDocumentDownload } = useDocumentConfig();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const editorStateRef = useRef<EditorState | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const { state: modifyState, open: modifyOpen, close: modifyClose, stop: modifyStop, submit: modifySubmit, clearPreview: modifyClearPreview } = useModify();

  const getEditorState = useCallback(() => editorStateRef.current, []);
  const { state: keysmashState, open: keysmashOpen, close: keysmashClose, stop: keysmashStop, submit: keysmashSubmit, clearPreview: keysmashClearPreview } = useKeysmash(getEditorState);

  const handleEditorStateChange = useCallback((state: EditorState) => {
    editorStateRef.current = state;
  }, []);

  const getDocumentContext = useCallback(() => {
    const state = editorStateRef.current;
    if (!state) return "";
    const aiDoc = extractDocument(state.doc);
    return toMarkdown(aiDoc);
  }, []);

  const getEditorDoc = useCallback(() => editorStateRef.current?.doc ?? null, []);

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
    modifyClose();
  }, [modifyState.target, modifyState.buffer, modifyClose]);

  const handleKeysmashApply = useCallback(() => {
    const view = editorViewRef.current;
    if (!view || !keysmashState.buffer) return;
    insertGeneratedText(view, keysmashState.buffer);
    keysmashClose();
  }, [keysmashState.buffer, keysmashClose]);

  const handleViewReady = useCallback((view: EditorView | null) => {
    editorViewRef.current = view;
  }, []);

  if (!loaded) return null;

  const combinedEditorStyles = {
    ...editorStyles,
    "--editor-max-height": `${documentConfig.maxHeight}vh`,
  } as React.CSSProperties;

  return (
    <>
      <PaperScene config={config} className="scene-canvas" showLightHelper={activePanel === "scene"} />
      <div className="editor-overlay" style={chatOpen ? { marginRight: "340px" } : undefined}>
        <ProseMirrorEditor
          onSceneToggle={() => setActivePanel((v) => v === "scene" ? null : "scene")}
          onEditorToggle={() => setActivePanel((v) => v === "editor" ? null : "editor")}
          onExportToggle={() => setActivePanel((v) => v === "export" ? null : "export")}
          onDocumentToggle={() => setActivePanel((v) => v === "document" ? null : "document")}
          onChatToggle={() => setChatOpen((v) => !v)}
          onModifyToggle={handleModifyToggle}
          onKeysmash={keysmashOpen}
          isKeysmashing={keysmashState.isStreaming}
          chatOpen={chatOpen}
          onStateChange={handleEditorStateChange}
          onViewReady={handleViewReady}
          editorStyles={combinedEditorStyles}
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
        onStop={modifyStop}
        onApply={handleModifyApply}
        onClearPreview={modifyClearPreview}
      />
      <KeysmashPrompt
        keysmashState={keysmashState}
        onSubmit={keysmashSubmit}
        onClose={keysmashClose}
        onStop={keysmashStop}
        onApply={handleKeysmashApply}
        onClearPreview={keysmashClearPreview}
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
      {activePanel === "document" && (
        <DocumentOptions
          config={documentConfig}
          onChange={onDocumentChange}
          onSave={onDocumentSave}
          onReset={onDocumentReset}
          onDownload={onDocumentDownload}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === "export" && (
        <ExportOptions
          getDocument={getEditorDoc}
          onClose={() => setActivePanel(null)}
        />
      )}
    </>
  );
}