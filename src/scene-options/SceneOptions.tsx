import { useCallback } from "react";
import type { SceneConfig, MaterialConfig, PointLightConfig, AmbientLightConfig, PlaneConfig, TextureStyle } from "../scene/config";
import type { Preset } from "../hooks/useSceneConfig";
import { Section, SliderField, ColorField, CheckboxField, SelectField, PathField, PanelActions } from "../components/panel";
import "../components/panel/panel.css";

interface SceneOptionsProps {
  config: SceneConfig;
  presets: Preset[];
  activePreset: string;
  onChange: (next: SceneConfig) => void;
  onSave: () => void;
  onReset: () => void;
  onPresetChange: (name: string) => void;
  onDownload: () => void;
  onClose: () => void;
}

function patchConfig(config: SceneConfig, partial: Partial<SceneConfig>): SceneConfig {
  return {
    ...config,
    ...partial,
    material: { ...config.material, ...partial.material },
    pointLight: { ...config.pointLight, ...partial.pointLight },
    ambientLight: { ...config.ambientLight, ...partial.ambientLight },
    plane: { ...config.plane, ...partial.plane },
  };
}

type PatchFn = (partial: Partial<SceneConfig>) => void;

export default function SceneOptions({ config, presets, activePreset, onChange, onSave, onReset, onPresetChange, onDownload, onClose }: SceneOptionsProps) {
  const patch = useCallback(
    (partial: Partial<SceneConfig>) => onChange(patchConfig(config, partial)),
    [config, onChange],
  );

  return (
    <aside className="panel">
      <PanelActions title="Scene" onClose={onClose} onSave={onSave} onReset={onReset} onDownload={onDownload} />
      <div className="panel-field">
        <SelectField
          label="Preset"
          value={activePreset}
          options={presets.map((p) => ({ value: p.name, label: p.name }))}
          onChange={onPresetChange}
        />
      </div>
      <MaterialSection material={config.material} onChange={(m) => patch({ material: m })} />
      <PointLightSection light={config.pointLight} onChange={(l) => patch({ pointLight: l })} />
      <AmbientLightSection light={config.ambientLight} onChange={(l) => patch({ ambientLight: l })} />
      <PlaneSection plane={config.plane} onChange={(p) => patch({ plane: p })} />
      <CameraSection position={config.cameraPosition} fov={config.cameraFov} bgColor={config.backgroundColor} onChange={patch} />
    </aside>
  );
}

function MaterialSection({ material, onChange }: { material: MaterialConfig; onChange: (m: MaterialConfig) => void }) {
  const patch = useCallback((partial: Partial<MaterialConfig>) => onChange({ ...material, ...partial }), [material, onChange]);

  return (
    <Section title="Material">
      <PathField label="Name" value={material.name} onChange={(v) => patch({ name: v })} />
      <SelectField label="Texture Style" value={material.textureStyle} options={[{ value: "clamp", label: "Clamp" }, { value: "stretch", label: "Stretch" }, { value: "tile", label: "Tile" }]} onChange={(v) => patch({ textureStyle: v as TextureStyle })} />
      {material.textureStyle === "tile" && (
        <>
          <SliderField label="Tile X" value={material.tileX} min={1} max={20} step={1} onChange={(v) => patch({ tileX: v })} />
          <SliderField label="Tile Y" value={material.tileY} min={1} max={20} step={1} onChange={(v) => patch({ tileY: v })} />
        </>
      )}
      <PathField label="Diffuse" value={material.diffuse} onChange={(v) => patch({ diffuse: v })} />
      <PathField label="Roughness Map" value={material.roughness} onChange={(v) => patch({ roughness: v })} />
      <PathField label="Normal Map" value={material.normal} onChange={(v) => patch({ normal: v })} />
      <PathField label="Height Map" value={material.height} onChange={(v) => patch({ height: v })} />
      {material.specular !== undefined && <PathField label="Specular Map" value={material.specular} onChange={(v) => patch({ specular: v })} />}
      {material.ao !== undefined && <PathField label="AO Map" value={material.ao} onChange={(v) => patch({ ao: v })} />}
      <SliderField label="Roughness Scale" value={material.roughnessScale} min={0} max={1} step={0.01} onChange={(v) => patch({ roughnessScale: v })} />
      <SliderField label="Normal Scale" value={material.normalScale} min={0} max={2} step={0.01} onChange={(v) => patch({ normalScale: v })} />
      <SliderField label="Metalness" value={material.metalness} min={0} max={1} step={0.01} onChange={(v) => patch({ metalness: v })} />
      <SliderField label="AO Scale" value={material.aoScale} min={0} max={3} step={0.01} onChange={(v) => patch({ aoScale: v })} />
    </Section>
  );
}

function PointLightSection({ light, onChange }: { light: PointLightConfig; onChange: (l: PointLightConfig) => void }) {
  const patch = useCallback((partial: Partial<PointLightConfig>) => onChange({ ...light, ...partial }), [light, onChange]);

  return (
    <Section title="Point Light">
      <SliderField label="Position X" value={light.position[0]} min={-20} max={20} step={0.1} onChange={(v) => patch({ position: [v, light.position[1], light.position[2]] })} />
      <SliderField label="Position Y" value={light.position[1]} min={0} max={20} step={0.1} onChange={(v) => patch({ position: [light.position[0], v, light.position[2]] })} />
      <SliderField label="Position Z" value={light.position[2]} min={-20} max={20} step={0.1} onChange={(v) => patch({ position: [light.position[0], light.position[1], v] })} />
      <SliderField label="Intensity" value={light.intensity} min={0} max={1000} step={1} onChange={(v) => patch({ intensity: v })} />
      <ColorField label="Color" value={light.color} onChange={(v) => patch({ color: v })} />
      <SliderField label="Distance" value={light.distance} min={0} max={200} step={1} onChange={(v) => patch({ distance: v })} />
      <SliderField label="Decay" value={light.decay} min={0} max={4} step={0.1} onChange={(v) => patch({ decay: v })} />
      <CheckboxField label="Cast Shadow" value={light.castShadow} onChange={(v) => patch({ castShadow: v })} />
    </Section>
  );
}

function AmbientLightSection({ light, onChange }: { light: AmbientLightConfig; onChange: (l: AmbientLightConfig) => void }) {
  const patch = useCallback((partial: Partial<AmbientLightConfig>) => onChange({ ...light, ...partial }), [light, onChange]);

  return (
    <Section title="Ambient Light">
      <SliderField label="Intensity" value={light.intensity} min={0} max={2} step={0.01} onChange={(v) => patch({ intensity: v })} />
      <ColorField label="Color" value={light.color} onChange={(v) => patch({ color: v })} />
    </Section>
  );
}

function PlaneSection({ plane, onChange }: { plane: PlaneConfig; onChange: (p: PlaneConfig) => void }) {
  const patch = useCallback((partial: Partial<PlaneConfig>) => onChange({ ...plane, ...partial }), [plane, onChange]);

  return (
    <Section title="Plane">
      <SliderField label="Width" value={plane.width} min={0.5} max={100} step={0.5} onChange={(v) => patch({ width: v })} />
      <SliderField label="Height" value={plane.height} min={0.5} max={100} step={0.5} onChange={(v) => patch({ height: v })} />
      <SliderField label="Segments" value={plane.segments} min={1} max={128} step={1} onChange={(v) => patch({ segments: v })} />
    </Section>
  );
}

function CameraSection({ position, fov, bgColor, onChange }: { position: [number, number, number]; fov: number; bgColor: string; onChange: PatchFn }) {
  return (
    <Section title="Camera">
      <SliderField label="Position X" value={position[0]} min={-20} max={20} step={0.1} onChange={(v) => onChange({ cameraPosition: [v, position[1], position[2]] })} />
      <SliderField label="Position Y" value={position[1]} min={0} max={20} step={0.1} onChange={(v) => onChange({ cameraPosition: [position[0], v, position[2]] })} />
      <SliderField label="Position Z" value={position[2]} min={-20} max={20} step={0.1} onChange={(v) => onChange({ cameraPosition: [position[0], position[1], v] })} />
      <SliderField label="FOV" value={fov} min={10} max={120} step={1} onChange={(v) => onChange({ cameraFov: v })} />
      <ColorField label="Background" value={bgColor} onChange={(v) => onChange({ backgroundColor: v })} />
    </Section>
  );
}