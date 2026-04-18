function norm(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function pickString(
  fields: Record<string, unknown>,
  candidates: string[],
): string | null {
  const normalizedCandidates = candidates.map(norm);
  for (const [key, value] of Object.entries(fields)) {
    const nk = norm(key);
    if (normalizedCandidates.some((c) => nk.includes(c))) {
      const str = stringifyValue(value);
      if (str) return str;
    }
  }
  return null;
}

export function stringifyValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value
      .map(stringifyValue)
      .filter((v): v is string => !!v);
    return parts.length ? parts.join(", ") : null;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const parts = Object.values(obj)
      .map(stringifyValue)
      .filter((v): v is string => !!v);
    return parts.length ? parts.join(" ") : null;
  }
  return null;
}

export function pickReliability(
  fields: Record<string, unknown>,
  candidates: string[],
): number | null {
  const raw = pickString(fields, candidates);
  if (!raw) return null;

  const pct = raw.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) return clamp01(parseFloat(pct[1]) / 100);

  const frac = raw.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (frac) return clamp01(parseFloat(frac[1]) / parseFloat(frac[2]));

  const num = raw.match(/(-?\d+(?:\.\d+)?)/);
  if (num) {
    const v = parseFloat(num[1]);
    if (v > 1) return clamp01(v / 10);
    return clamp01(v);
  }

  const word = raw.toLowerCase();
  if (/\b(high|yüksek|reliable|güvenilir)\b/.test(word)) return 0.85;
  if (/\b(medium|orta|maybe)\b/.test(word)) return 0.5;
  if (/\b(low|düşük|unreliable|şüpheli)\b/.test(word)) return 0.2;

  return null;
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

export function pickTimestamp(
  fields: Record<string, unknown>,
  candidates: string[],
  fallback: string | null,
): string | null {
  const raw = pickString(fields, candidates);
  if (raw) {
    const iso = toIso(raw);
    if (iso) return iso;
  }
  if (fallback) return toIso(fallback) ?? fallback;
  return null;
}

function toIso(value: string): string | null {
  const ms = Date.parse(value);
  if (!Number.isNaN(ms)) return new Date(ms).toISOString();
  return null;
}
