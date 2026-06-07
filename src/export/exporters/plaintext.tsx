import { FileType } from "lucide-react";
import type { Exporter } from "../types";
import { extractDocument, toPlaintext } from "../../document";

export const plaintextExporter: Exporter = {
  id: "plaintext",
  label: "Plaintext",
  icon: <FileType className="size-4" />,
  mimeType: "text/plain",
  extension: "txt",
  serialize(doc) {
    return toPlaintext(extractDocument(doc));
  },
};
