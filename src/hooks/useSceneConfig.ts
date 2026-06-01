import { useState, useEffect, useCallback } from "react";
import { loadFromStorage, saveToStorage, clearStorage, downloadJson } from "./useStorage";
import { defaultSceneConfig } from "../scene/config";
import type { SceneConfig } from "../scene/config";

const STORAGE_KEY = "prose-forge-scene-config";

export interface Preset {
  name: string;
  material: SceneConfig["material"];
  pointLight: SceneConfig["pointLight"];
  ambientLight: SceneConfig["ambientLight"];
  plane: SceneConfig["plane"];
  cameraPosition: [number, number, number];
  cameraFov: number;
  backgroundColor: string;
}

function presetToConfig(preset: Preset): SceneConfig {
  return {
    material: preset.material,
    pointLight: preset.pointLight,
    ambientLight: preset.ambientLight,
    plane: preset.plane,
    cameraPosition: preset.cameraPosition,
    cameraFov: preset.cameraFov,
    backgroundColor: preset.backgroundColor,
  };
}

export function useSceneConfig() {
  const [config, setConfig] = useState<SceneConfig>(defaultSceneConfig);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [activePreset, setActivePreset] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      let presetName = "";
      const localConfig = loadFromStorage<SceneConfig>(STORAGE_KEY);
      if (localConfig) {
        presetName = localConfig.material?.name ?? "";
        setConfig(localConfig);
      }

      try {
        const res = await fetch("/assets/presets.json");
        const data: Preset[] = await res.json();
        setPresets(data);

        if (!localConfig && data.length > 0) {
          const first = data.find((p) => p.name === "paper") ?? data[0];
          presetName = first.name;
          setConfig(presetToConfig(first));
        }

        if (localConfig) {
          presetName = localConfig.material?.name ?? presetName;
        }
      } catch {
        if (!localConfig) {
          setConfig(defaultSceneConfig);
          presetName = defaultSceneConfig.material.name;
        }
      }

      setActivePreset(presetName);
      setLoaded(true);
    }
    init();
  }, []);

  const handleChange = useCallback((next: SceneConfig) => {
    setConfig(next);
  }, []);

  const handleSave = useCallback(() => {
    saveToStorage(STORAGE_KEY, config);
  }, [config]);

  const handleReset = useCallback(() => {
    clearStorage(STORAGE_KEY);
    const fallback = presets.length > 0
      ? presets.find((p) => p.name === "paper") ?? presets[0]
      : null;
    const resetConfig = fallback ? presetToConfig(fallback) : defaultSceneConfig;
    setConfig(resetConfig);
    setActivePreset(resetConfig.material.name);
  }, [presets]);

  const handlePresetChange = useCallback((name: string) => {
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      setConfig(presetToConfig(preset));
      setActivePreset(name);
    }
  }, [presets]);

  const handleDownload = useCallback(() => {
    downloadJson(config, "presets.json");
  }, [config]);

  return {
    config,
    presets,
    activePreset,
    loaded,
    onChange: handleChange,
    onSave: handleSave,
    onReset: handleReset,
    onPresetChange: handlePresetChange,
    onDownload: handleDownload,
  };
}