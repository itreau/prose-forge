import { X } from "lucide-react";

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "1.5rem",
          maxWidth: "24rem",
          width: "100%",
          boxShadow: "var(--shadow)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontWeight: 600 }}>Confirm</span>
          <button
            className="panel-btn"
            onClick={onCancel}
            type="button"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
        </div>
        <p style={{ fontSize: "0.875rem", marginBottom: "1.25rem", color: "var(--muted-foreground)" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            className="panel-btn"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="panel-btn"
            onClick={onConfirm}
            type="button"
            style={{ background: "var(--destructive)", color: "#fff" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}