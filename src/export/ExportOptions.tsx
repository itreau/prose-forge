import { useState } from "react";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import { Section, PanelActions } from "../components/panel";
import "../components/panel/panel.css";
import { EXPORTERS } from "./exporters";
import type { Exporter } from "./types";
import { downloadText } from "./download";

interface ExportOptionsProps {
  getDocument: () => ProseMirrorNode | null;
  onClose: () => void;
}

function sanitizeFilename(title: string): string {
  return title.replace(/[^a-zA-Z0-9._\- ]+/g, "").trim();
}

export default function ExportOptions({ getDocument, onClose }: ExportOptionsProps) {
  const [title, setTitle] = useState("");

  const handleExport = async (exporter: Exporter) => {
    const doc = getDocument();
    if (!doc) return;
    const trimmed = title.trim();
    const base = trimmed ? sanitizeFilename(trimmed) : "document";
    const filename = `${base}.${exporter.extension}`;
    await downloadText(exporter.serialize(doc), filename, exporter.mimeType);
  };

  return (
    <aside className="panel">
      <PanelActions title="Export" onClose={onClose} />
      <Section title="Format">
        <div className="panel-field">
          <span className="panel-field-label">Title (optional)</span>
          <input
            type="text"
            className="panel-text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="document"
          />
        </div>
        <div className="panel-field">
          <span className="panel-field-label">Format</span>
          <div className="panel-buttons" style={{ flexDirection: "column", alignItems: "stretch" }}>
            {EXPORTERS.map((exporter) => (
              <button
                key={exporter.id}
                className="panel-btn"
                onClick={() => handleExport(exporter)}
                type="button"
                style={{ justifyContent: "flex-start" }}
              >
                {exporter.icon}
                {exporter.label}
              </button>
            ))}
          </div>
        </div>
      </Section>
    </aside>
  );
}
