export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function stringifyJsonArray(values: unknown): string {
  if (!Array.isArray(values)) return "[]";
  return JSON.stringify(values.filter((v) => v != null && v !== "").map(String));
}
