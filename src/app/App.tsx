import { useState } from "react";
import ProseMirrorEditor from "../editor/ProseMirrorEditor";
import { PaperScene } from "../scene";
import SceneOptions from "../scene-options/SceneOptions";
import EditorOptions from "../editor-options/EditorOptions";
import { useSceneConfig } from "../hooks/useSceneConfig";
import { useEditorConfig } from "../hooks/useEditorConfig";

type ActivePanel = "scene" | "editor" | null;

export default function App() {
  const { config, presets, activePreset, loaded, onChange, onSave, onReset, onPresetChange, onDownload: onSceneDownload } = useSceneConfig();
  const { config: editorConfig, editorStyles, onChange: onEditorChange, onSave: onEditorSave, onReset: onEditorReset, onDownload: onEditorDownload } = useEditorConfig(config.pointLight.position);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  if (!loaded) return null;

  return (
    <>
      <PaperScene config={config} className="scene-canvas" />
      <div className="editor-overlay">
        <ProseMirrorEditor
          onSceneToggle={() => setActivePanel((v) => v === "scene" ? null : "scene")}
          onEditorToggle={() => setActivePanel((v) => v === "editor" ? null : "editor")}
          editorStyles={editorStyles}
        />
      </div>
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