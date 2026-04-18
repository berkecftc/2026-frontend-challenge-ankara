import { CACHE_PREFIX } from "../constants";
import type { NormalizedSubmission } from "./jotform";

interface CacheEntry {
  expiresAt: number;
  data: NormalizedSubmission[];
}

export function buildCacheKey(
  formId: string,
  limit?: number,
  offset?: number,
): string {
  return `${CACHE_PREFIX}${formId}:${limit ?? ""}:${offset ?? ""}`;
}

export function readCache(key: string): NormalizedSubmission[] | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry;
    const isExpired = !entry?.expiresAt || entry.expiresAt < Date.now();
    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function writeCache(
  key: string,
  data: NormalizedSubmission[],
  ttlMs: number,
): void {
  if (typeof localStorage === "undefined") return;
  try {
    const entry: CacheEntry = { expiresAt: Date.now() + ttlMs, data };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch { }
}

export function clearCache(): void {
  if (typeof localStorage === "undefined") return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
