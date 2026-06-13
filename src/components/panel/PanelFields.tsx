import { useState } from "react";
import { ChevronRight, Save, RotateCcw, Download, X } from "lucide-react";

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="panel-section">
      <button
        className="panel-section-header"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {title}
        <ChevronRight
          className={`panel-chevron ${open ? "panel-chevron-open" : ""}`}
          size={14}
        />
      </button>
      {open && <div className="panel-section-body">{children}</div>}
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (!editing) setDraft(String(value));
  }

  return (
    <div className="panel-field">
      <span className="panel-field-label">{label}</span>
      <div className="panel-field-row">
        <input
          type="range"
          className="panel-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <input
          type="number"
          className="panel-number-input"
          min={min}
          max={max}
          step={step}
          value={editing ? draft : value}
          onChange={(e) => {
            setDraft(e.target.value);
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          onFocus={() => {
            setEditing(true);
            setDraft(String(value));
          }}
          onBlur={() => {
            setEditing(false);
            const v = parseFloat(draft);
            if (!isNaN(v)) {
              onChange(Math.min(max, Math.max(min, v)));
            } else {
              setDraft(String(value));
            }
          }}
        />
      </div>
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="panel-field">
      <span className="panel-field-label">{label}</span>
      <div className="panel-field-row">
        <input
          type="color"
          className="panel-color-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className="panel-text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function CheckboxField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="panel-row-inline">
      <span className="panel-field-label">{label}</span>
      <input
        type="checkbox"
        className="panel-checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="panel-field">
      <span className="panel-field-label">{label}</span>
      <select
        className="panel-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function PathField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  return (
    <div className="panel-field">
      <span className="panel-field-label">{label}</span>
      <input
        type="text"
        className="panel-text-input"
        data-path-label={label}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => onChange(local)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onChange(local);
        }}
      />
    </div>
  );
}

export function PanelActions({
  title,
  onClose,
  onSave,
  onReset,
  onDownload,
}: {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  onReset?: () => void;
  onDownload?: () => void;
}) {
  return (
    <div className="panel-actions">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-h)" }}>{title}</span>
        <button className="panel-btn" onClick={onClose} type="button" title="Close">
          <X size={14} />
        </button>
      </div>
      {(onSave || onReset || onDownload) && (
        <div className="panel-buttons">
          {onSave && (
            <button className="panel-btn" onClick={onSave} type="button" title="Save to local storage">
              <Save size={14} />
              Save
            </button>
          )}
          {onReset && (
            <button className="panel-btn" onClick={onReset} type="button" title="Reset to defaults">
              <RotateCcw size={14} />
              Reset
            </button>
          )}
          {onDownload && (
            <button className="panel-btn" onClick={onDownload} type="button" title="Download JSON">
              <Download size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}