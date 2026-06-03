import { useState, useRef, useEffect } from "react";
import { X, Send, Trash2 } from "lucide-react";
import { useChat } from "./use-chat";
import "./chat-sidebar.css";

interface ChatSidebarProps {
  onClose: () => void;
  getDocumentContext: () => string;
}

export default function ChatSidebar({ onClose, getDocumentContext }: ChatSidebarProps) {
  const { state, sendMessage, clear } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  const handleSend = () => {
    if (!input.trim() || state.isStreaming) return;
    const docContext = getDocumentContext();
    sendMessage(input.trim(), docContext);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        <span className="chat-sidebar-title">AI Chat</span>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {state.messages.length > 0 && (
            <button className="panel-btn" onClick={clear} type="button" title="Clear">
              <Trash2 size={14} />
            </button>
          )}
          <button className="panel-btn" onClick={onClose} type="button" title="Close">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="chat-messages">
        {state.messages.length === 0 && (
          <div className="chat-empty">Ask about your writing...</div>
        )}
        {state.messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message-${msg.role}`}>
            {msg.content || (msg.role === "assistant" && state.isStreaming ? "\u2026" : "")}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {state.error && <div className="chat-error">{state.error}</div>}
      <div className="chat-input-area">
        <textarea
          className="chat-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your writing..."
          rows={2}
          disabled={state.isStreaming}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={state.isStreaming || !input.trim()}
          type="button"
          title="Send"
        >
          <Send size={16} />
        </button>
      </div>
    </aside>
  );
}