import { useState, useEffect, useCallback } from "react";

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

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, config: T): void {
  localStorage.setItem(key, JSON.stringify(config));
}

function clearStorage(key: string): void {
  localStorage.removeItem(key);
}

function downloadJson<T>(config: T, filename: string): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useConfig<T>(options: UseConfigOptions<T>): UseConfigResult<T> {
  const { storageKey, fetchUrl, defaultValue } = options;
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
          setConfig(defaultValue);
        }
      }
      setLoaded(true);
    }
    init();
  }, [storageKey, fetchUrl, defaultValue]);

  const handleChange = useCallback((next: T) => {
    setConfig(next);
  }, []);

  const handleSave = useCallback(() => {
    saveToStorage(storageKey, config);
  }, [storageKey, config]);

  const handleReset = useCallback(() => {
    clearStorage(storageKey);
    setConfig(defaultValue);
  }, [storageKey, defaultValue]);

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