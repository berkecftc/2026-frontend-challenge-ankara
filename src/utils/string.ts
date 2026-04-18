export function normalizeText(value: string | null | undefined): string {
  if (!value) return "";
  return value.toLowerCase().trim();
}
