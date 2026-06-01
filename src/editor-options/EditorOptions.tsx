import { useCallback } from "react";
import type { EditorConfig } from "../editor/EditorConfig";
import { Section, SliderField, ColorField, CheckboxField, PanelActions } from "../components/panel";
import "../components/panel/panel.css";

interface EditorOptionsProps {
  config: EditorConfig;
  onChange: (next: EditorConfig) => void;
  onSave: () => void;
  onReset: () => void;
  onDownload: () => void;
  onClose: () => void;
}

export default function EditorOptions({ config, onChange, onSave, onReset, onDownload, onClose }: EditorOptionsProps) {
  const patch = useCallback(
    (partial: Partial<EditorConfig>) => onChange({ ...config, ...partial }),
    [config, onChange],
  );

  return (
    <aside className="panel">
      <PanelActions title="Editor" onClose={onClose} onSave={onSave} onReset={onReset} onDownload={onDownload} />
      <Section title="Appearance">
        <SliderField label="Background Opacity (%)" value={config.opacity} min={0} max={100} step={1} onChange={(v) => patch({ opacity: v })} />
        <ColorField label="Text Color" value={config.textColor} onChange={(v) => patch({ textColor: v })} />
        <ColorField label="Heading Color" value={config.headingColor} onChange={(v) => patch({ headingColor: v })} />
      </Section>
      <Section title="Text Shadow">
        <CheckboxField label="Enabled" value={config.shadowEnabled} onChange={(v) => patch({ shadowEnabled: v })} />
        {config.shadowEnabled && (
          <>
            <SliderField label="Blur" value={config.shadowBlur} min={0} max={20} step={0.5} onChange={(v) => patch({ shadowBlur: v })} />
            <ColorField label="Shadow Color" value={config.shadowColor} onChange={(v) => patch({ shadowColor: v })} />
            <SliderField label="Shadow Opacity" value={config.shadowOpacity} min={0} max={1} step={0.01} onChange={(v) => patch({ shadowOpacity: v })} />
          </>
        )}
      </Section>
      <Section title="Toolbar">
        <ColorField label="Border Color" value={config.toolbarBorderColor} onChange={(v) => patch({ toolbarBorderColor: v })} />
        <ColorField label="Icon Color" value={config.toolbarIconColor} onChange={(v) => patch({ toolbarIconColor: v })} />
        <ColorField label="Button Hover BG" value={config.toolbarButtonHoverBg} onChange={(v) => patch({ toolbarButtonHoverBg: v })} />
        <ColorField label="Button Active BG" value={config.toolbarButtonActiveBg} onChange={(v) => patch({ toolbarButtonActiveBg: v })} />
      </Section>
    </aside>
  );
}