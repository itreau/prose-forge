import type { Exporter } from "./types";
import { markdownExporter } from "./exporters/markdown";
import { plaintextExporter } from "./exporters/plaintext";

export const EXPORTERS: Exporter[] = [markdownExporter, plaintextExporter];

export function getExporter(id: string): Exporter | undefined {
  return EXPORTERS.find((e) => e.id === id);
}
