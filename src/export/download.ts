import { isTauri, tauriSaveFile } from "../lib/tauri";

export async function downloadText(content: string, filename: string, _mimeType: string): Promise<void> {
  if (isTauri()) {
    await tauriSaveFile(content, filename);
    return;
  }

  const blob = new Blob([content], { type: _mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}