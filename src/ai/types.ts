export interface AIDocument {
  chunks: AIDocumentChunk[];
  cursorPosition?: number;
}

export interface AIDocumentChunk {
  id: string;
  type: "paragraph" | "heading" | "code_block";
  level?: number;
  content: string;
}

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
  return {
    apiUrl: import.meta.env.VITE_AI_API_URL ?? "",
    apiKey: import.meta.env.VITE_AI_API_KEY ?? "",
    modelName: import.meta.env.VITE_AI_MODEL ?? "",
  };
}