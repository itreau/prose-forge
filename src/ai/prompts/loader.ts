const PLACEHOLDER_RE = /\{\{(\w+)\}\}/g;

export function loadPrompt(
  template: string,
  vars: Record<string, string>,
): string {
  const result = template.replace(PLACEHOLDER_RE, (match, key: string) => {
    if (key in vars) return vars[key];
    return match;
  });

  const missing = result.match(PLACEHOLDER_RE);
  if (missing) {
    const unique = [...new Set(missing)];
    throw new Error(
      `Unfilled prompt template variable(s): ${unique.join(", ")}`,
    );
  }

  return result;
}