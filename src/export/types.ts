import type { ReactNode } from "react";
import type { Node as ProseMirrorNode } from "prosemirror-model";

export interface Exporter {
  id: string;
  label: string;
  icon: ReactNode;
  mimeType: string;
  extension: string;
  serialize(doc: ProseMirrorNode): string;
}
