export interface EditorConfig {
  opacity: number;
  textColor: string;
  headingColor: string;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowColor: string;
  shadowOpacity: number;
  toolbarBorderColor: string;
  toolbarIconColor: string;
  toolbarButtonHoverBg: string;
  toolbarButtonActiveBg: string;
}

export const defaultEditorConfig: EditorConfig = {
  opacity: 10,
  textColor: "#6b6375",
  headingColor: "#08060d",
  shadowEnabled: true,
  shadowBlur: 2,
  shadowColor: "#000000",
  shadowOpacity: 0.25,
  toolbarBorderColor: "var(--border)",
  toolbarIconColor: "var(--text)",
  toolbarButtonHoverBg: "var(--muted)",
  toolbarButtonActiveBg: "var(--muted)",
};

export function computeTextShadow(
  lightPosition: [number, number, number],
  config: EditorConfig,
): string {
  if (!config.shadowEnabled) return "none";

  const [lx, ly, lz] = lightPosition;
  const dist = Math.sqrt(lx * lx + ly * ly + lz * lz);
  if (dist === 0) return "none";

  const nx = lx / dist;
  const nz = lz / dist;

  const maxOffset = 8;
  const offsetX = -nx * maxOffset;
  const offsetY = Math.max(0, nz) * maxOffset;

  const blur = config.shadowBlur;
  const opacity = config.shadowOpacity;

  const r = parseInt(config.shadowColor.slice(1, 3), 16);
  const g = parseInt(config.shadowColor.slice(3, 5), 16);
  const b = parseInt(config.shadowColor.slice(5, 7), 16);

  return `${offsetX.toFixed(1)}px ${offsetY.toFixed(1)}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity})`;
}