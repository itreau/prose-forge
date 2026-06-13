import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export function isTauri(): boolean {
  return typeof window !== "undefined" && !!(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
}

export function markTauri(): void {
  if (typeof document !== "undefined" && isTauri()) {
    document.documentElement.dataset.tauri = "";
  }
}

const TEXT_FILE_FILTERS = [{ name: "Text documents", extensions: ["txt", "md"] }];

export async function tauriPickFile(): Promise<{ content: string; name: string } | null> {
  const selected = await open({
    multiple: false,
    filters: TEXT_FILE_FILTERS,
  });
  if (!selected || Array.isArray(selected)) return null;
  const content = await readTextFile(selected);
  const name = selected.split("/").pop()?.split("\\").pop() ?? "document";
  return { content, name };
}

export async function tauriSaveFile(content: string, defaultName: string): Promise<boolean> {
  const filePath = await save({
    filters: TEXT_FILE_FILTERS,
    defaultPath: defaultName,
  });
  if (!filePath) return false;
  await writeTextFile(filePath, content);
  return true;
}