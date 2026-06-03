import { useState, useRef } from "react";
import { X, Send, StopCircle } from "lucide-react";
import type { ModifyState } from "./use-modify";
import "./modify-prompt.css";

interface ModifyPromptProps {
  modifyState: ModifyState;
  onSubmit: (prompt: string) => void;
  onClose: () => void;
}

export default function ModifyPrompt({
  modifyState,
  onSubmit,
  onClose,
}: ModifyPromptProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || modifyState.isStreaming) return;
    onSubmit(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const contextHint = modifyState.target
    ? modifyState.target.text.length > 100
      ? modifyState.target.text.slice(0, 100) + "\u2026"
      : modifyState.target.text
    : "";

  const streamComplete = !modifyState.isStreaming && modifyState.buffer.length > 0;

  if (!modifyState.isOpen) return null;

  const showInput = !modifyState.isStreaming && !streamComplete;

  return (
    <div className="modify-prompt-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modify-prompt" onClick={(e) => e.stopPropagation()}>
        <div className="modify-prompt-header">
          <span className="modify-prompt-title">AI Modify</span>
          <button className="panel-btn" onClick={onClose} type="button" title="Close">
            <X size={14} />
          </button>
        </div>
        {contextHint && (
          <div className="modify-prompt-context">{contextHint}</div>
        )}
        {showInput && (
          <>
            <textarea
              key={modifyState.target ? "open" : "closed"}
              ref={textareaRef}
              className="modify-prompt-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Rewrite more formally\u2026"
              rows={2}
              autoFocus
            />
            <div className="modify-prompt-actions">
              <button
                className="modify-btn modify-btn-primary"
                onClick={handleSubmit}
                disabled={!input.trim()}
                type="button"
              >
                <Send size={14} />
                Send
              </button>
              <button className="modify-btn" onClick={onClose} type="button">
                Cancel
              </button>
            </div>
          </>
        )}
        {modifyState.error && <div className="modify-error">{modifyState.error}</div>}
      </div>
    </div>
  );
}

export function ModifyPreview({
  modifyState,
  onStop,
  onClearPreview,
  onApply,
}: {
  modifyState: ModifyState;
  onStop: () => void;
  onClearPreview: () => void;
  onApply: () => void;
}) {
  if (!modifyState.buffer) return null;

  const streamComplete = !modifyState.isStreaming && modifyState.buffer.length > 0;

  return (
    <div
      className="modify-preview-wrapper"
      style={{
        margin: "0.5rem 0",
        padding: "0.75rem",
        background: "var(--accent-bg)",
        border: "1px solid var(--accent-border)",
        borderRadius: "6px",
        fontSize: "0.8125rem",
        whiteSpace: "pre-wrap" as const,
        wordBreak: "break-word" as const,
        color: "var(--text-h)",
        maxHeight: "200px",
        overflowY: "auto" as const,
        position: "relative" as const,
      }}
    >
      <div className="modify-preview-label">
        {modifyState.isStreaming ? "Generating\u2026" : "Preview"}
      </div>
      {modifyState.buffer}
      {modifyState.isStreaming && (
        <button
          className="modify-btn"
          onClick={onStop}
          type="button"
          style={{ marginTop: "0.5rem" }}
        >
          <StopCircle size={14} />
          Stop
        </button>
      )}
      {streamComplete && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button className="modify-btn modify-btn-primary" onClick={onApply} type="button">
            Apply
          </button>
          <button className="modify-btn" onClick={onClearPreview} type="button">
            Discard
          </button>
        </div>
      )}
    </div>
  );
}