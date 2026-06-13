import { isTauri } from "../lib/tauri";

export default function TitleBar() {
  if (!isTauri()) return null;

  return (
    <div data-tauri-drag-region className="title-bar-drag" />
  );
}