import { useCallback } from "react";
import type { DocumentConfig } from "../document/DocumentConfig";
import { Section, SliderField, PanelActions } from "../components/panel";
import "../components/panel/panel.css";

interface DocumentOptionsProps {
  config: DocumentConfig;
  onChange: (next: DocumentConfig) => void;
  onSave: () => void;
  onReset: () => void;
  onDownload: () => void;
  onClose: () => void;
}

export default function DocumentOptions({ config, onChange, onSave, onReset, onDownload, onClose }: DocumentOptionsProps) {
  const patch = useCallback(
    (partial: Partial<DocumentConfig>) => onChange({ ...config, ...partial }),
    [config, onChange],
  );

  return (
    <aside className="panel">
      <PanelActions title="Document" onClose={onClose} onSave={onSave} onReset={onReset} onDownload={onDownload} />
      <Section title="Layout">
        <SliderField label="Max Height (vh)" value={config.maxHeight} min={30} max={100} step={1} onChange={(v) => patch({ maxHeight: v })} />
      </Section>
    </aside>
  );
}
