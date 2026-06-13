export interface AIConfig {
  apiUrl: string;
  apiKey: string;
  modelName: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function loadAIConfig(): AIConfig {
  let apiUrl = import.meta.env.VITE_AI_API_URL ?? "";
  const isTauri = typeof window !== "undefined" && !!(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;

  if (isTauri && apiUrl.startsWith("/")) {
    const apiBase = import.meta.env.VITE_AI_API_BASE ?? "";
    apiUrl = apiBase + apiUrl.replace(/^\/api/, "");
  }

  return {
    apiUrl,
    apiKey: import.meta.env.VITE_AI_API_KEY ?? "",
    modelName: import.meta.env.VITE_AI_MODEL ?? "",
  };
}