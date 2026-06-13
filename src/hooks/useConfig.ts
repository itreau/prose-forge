import { useState, useEffect, useCallback, useRef } from "react";
import { loadFromStorage, saveToStorage, clearStorage, downloadJson } from "./useStorage";

export interface UseConfigOptions<T> {
  storageKey: string;
  fetchUrl: string;
  defaultValue: T;
}

export interface UseConfigResult<T> {
  config: T;
  loaded: boolean;
  onChange: (next: T) => void;
  onSave: () => void;
  onReset: () => void;
  onDownload: () => void;
}

export function useConfig<T>(options: UseConfigOptions<T>): UseConfigResult<T> {
  const { storageKey, fetchUrl, defaultValue } = options;
  const defaultValueRef = useRef(defaultValue);
  const [config, setConfig] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      const localConfig = loadFromStorage<T>(storageKey);
      if (localConfig) {
        setConfig(localConfig);
      } else {
        try {
          const res = await fetch(fetchUrl);
          const data: T = await res.json();
          setConfig(data);
        } catch {
          setConfig(defaultValueRef.current);
        }
      }
      setLoaded(true);
    }
    init();
  }, [storageKey, fetchUrl]);

  const handleChange = useCallback((next: T) => {
    setConfig(next);
  }, []);

  const handleSave = useCallback(() => {
    saveToStorage(storageKey, config);
  }, [storageKey, config]);

  const handleReset = useCallback(() => {
    clearStorage(storageKey);
    setConfig(defaultValueRef.current);
  }, [storageKey]);

  const handleDownload = useCallback(() => {
    downloadJson(config, `${storageKey}.json`);
  }, [config, storageKey]);

  return {
    config,
    loaded,
    onChange: handleChange,
    onSave: handleSave,
    onReset: handleReset,
    onDownload: handleDownload,
  };
}