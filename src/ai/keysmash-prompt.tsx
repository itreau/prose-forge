import { useState, useRef } from "react";
import { X, Send, Loader2, StopCircle } from "lucide-react";
import type { KeysmashState } from "./use-keysmash";
import "./modify-prompt.css";

interface KeysmashPromptProps {
  keysmashState: KeysmashState;
  onSubmit: (direction: string) => void;
  onClose: () => void;
  onStop: () => void;
  onApply: () => void;
  onClearPreview: () => void;
}

export default function KeysmashPrompt({
  keysmashState,
  onSubmit,
  onClose,
  onStop,
  onApply,
  onClearPreview,
}: KeysmashPromptProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (keysmashState.isStreaming) return;
    onSubmit(input.trim());
  };

  const handleBackdropClick = () => {
    if (keysmashState.isStreaming || keysmashState.buffer.length > 0) return;
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      if (keysmashState.isStreaming) {
        onStop();
      } else if (keysmashState.buffer.length > 0) {
        onClose();
      } else {
        onClose();
      }
    }
  };

  const streamComplete = !keysmashState.isStreaming && keysmashState.buffer.length > 0;

  if (!keysmashState.isOpen) return null;

  return (
    <div className="modify-prompt-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleBackdropClick(); }}>
      <div className={`modify-prompt${keysmashState.buffer ? " has-preview" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modify-prompt-header">
          <span className="modify-prompt-title">Generate Next Paragraph</span>
          <button className="panel-btn" onClick={onClose} type="button" title="Close">
            <X size={14} />
          </button>
        </div>
        <textarea
          ref={textareaRef}
          className="modify-prompt-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Optional: How should the next paragraph read?"
          rows={2}
          autoFocus
          disabled={keysmashState.isStreaming}
        />
        <div className="modify-prompt-actions">
          <button
            className="modify-btn modify-btn-primary"
            onClick={handleSubmit}
            disabled={keysmashState.isStreaming}
            type="button"
          >
            <Send size={14} />
            Send
          </button>
          {keysmashState.isStreaming && (
            <Loader2 className="size-4 animate-spin" style={{ color: "var(--accent)" }} />
          )}
          <button className="modify-btn" onClick={onClose} type="button">
            Cancel
          </button>
        </div>
        {keysmashState.error && <div className="modify-error">{keysmashState.error}</div>}
        {keysmashState.buffer && (
          <div className="modify-preview-inline">
            <div className="modify-preview-label">
              {keysmashState.isStreaming ? "Generating\u2026" : "Preview"}
            </div>
            <div className="modify-preview-text">{keysmashState.buffer}</div>
            <div className="modify-preview-actions">
              {keysmashState.isStreaming && (
                <button className="modify-btn" onClick={onStop} type="button">
                  <StopCircle size={14} />
                  Stop
                </button>
              )}
              {streamComplete && (
                <>
                  <button className="modify-btn modify-btn-primary" onClick={onApply} type="button">
                    Apply
                  </button>
                  <button className="modify-btn" onClick={onClearPreview} type="button">
                    Discard
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}