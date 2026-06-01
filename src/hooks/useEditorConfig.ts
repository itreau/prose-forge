import { useState, useEffect, useCallback } from "react";
import { loadFromStorage, saveToStorage, clearStorage, downloadJson } from "./useStorage";
import { defaultEditorConfig, computeTextShadow } from "../editor/EditorConfig";
import type { EditorConfig } from "../editor/EditorConfig";

const STORAGE_KEY = "prose-forge-editor-config";

export function useEditorConfig(lightPosition: [number, number, number]) {
  const [config, setConfig] = useState<EditorConfig>(defaultEditorConfig);
  const [loaded, setLoaded] = useState(false);

  const textShadow = computeTextShadow(lightPosition, config);

  useEffect(() => {
    async function init() {
      const localConfig = loadFromStorage<EditorConfig>(STORAGE_KEY);
      if (localConfig) {
        setConfig(localConfig);
      } else {
        try {
          const res = await fetch("/assets/editor-config.json");
          const data: EditorConfig = await res.json();
          setConfig(data);
        } catch {
          setConfig(defaultEditorConfig);
        }
      }
      setLoaded(true);
    }
    init();
  }, []);

  const handleChange = useCallback((next: EditorConfig) => {
    setConfig(next);
  }, []);

  const handleSave = useCallback(() => {
    saveToStorage(STORAGE_KEY, config);
  }, [config]);

  const handleReset = useCallback(() => {
    clearStorage(STORAGE_KEY);
    setConfig(defaultEditorConfig);
  }, []);

  const handleDownload = useCallback(() => {
    downloadJson(config, "editor-config.json");
  }, [config]);

  const editorStyles: React.CSSProperties = {
    "--editor-opacity": `${config.opacity}%`,
    "--editor-text-color": config.textColor,
    "--editor-heading-color": config.headingColor,
    "--editor-text-shadow": textShadow,
    "--editor-toolbar-border-color": config.toolbarBorderColor,
    "--editor-toolbar-icon-color": config.toolbarIconColor,
    "--editor-toolbar-button-hover-bg": config.toolbarButtonHoverBg,
    "--editor-toolbar-button-active-bg": config.toolbarButtonActiveBg,
  } as React.CSSProperties;

  return {
    config,
    loaded,
    editorStyles,
    onChange: handleChange,
    onSave: handleSave,
    onReset: handleReset,
    onDownload: handleDownload,
  };
}