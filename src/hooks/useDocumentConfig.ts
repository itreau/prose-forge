import { useState, useCallback } from "react";
import { loadFromStorage, saveToStorage, clearStorage, downloadJson } from "./useStorage";
import { defaultDocumentConfig } from "../document/DocumentConfig";
import type { DocumentConfig } from "../document/DocumentConfig";

const STORAGE_KEY = "prose-forge-document-config";

export function useDocumentConfig() {
  const [config, setConfig] = useState<DocumentConfig>(() => {
    const localConfig = loadFromStorage<DocumentConfig>(STORAGE_KEY);
    return localConfig ?? defaultDocumentConfig;
  });

  const handleChange = useCallback((next: DocumentConfig) => {
    setConfig(next);
  }, []);

  const handleSave = useCallback(() => {
    saveToStorage(STORAGE_KEY, config);
  }, [config]);

  const handleReset = useCallback(() => {
    clearStorage(STORAGE_KEY);
    setConfig(defaultDocumentConfig);
  }, []);

  const handleDownload = useCallback(() => {
    downloadJson(config, "document-config.json");
  }, [config]);

  return {
    config,
    onChange: handleChange,
    onSave: handleSave,
    onReset: handleReset,
    onDownload: handleDownload,
  };
}
