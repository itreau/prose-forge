import { FileText } from "lucide-react";
import type { Exporter } from "../types";
import { extractDocument, toMarkdown } from "../../document";

export const markdownExporter: Exporter = {
  id: "markdown",
  label: "Markdown",
  icon: <FileText className="size-4" />,
  mimeType: "text/markdown",
  extension: "md",
  serialize(doc) {
    return toMarkdown(extractDocument(doc));
  },
};
