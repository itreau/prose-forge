import { Sparkles, Loader2 } from "lucide-react";

interface KeysmashButtonProps {
  isGenerating: boolean;
  onClick: () => void;
}

export default function KeysmashButton({ isGenerating, onClick }: KeysmashButtonProps) {
  return (
    <button
      className="keysmash-btn"
      onClick={onClick}
      disabled={isGenerating}
      type="button"
      aria-label="Generate next paragraph"
      title={isGenerating ? "Generating\u2026" : "Generate next paragraph"}
    >
      {isGenerating ? (
        <Loader2 className="size-4 keysmash-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
    </button>
  );
}