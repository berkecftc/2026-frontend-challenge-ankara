import type { Record } from "../types";
import { normalizeText } from "./filters";

/** Group records by a canonical person key (lowercased, trimmed). */
export function groupRecordsByPerson(records: Record[]): Map<string, Record[]> {
  const map = new Map<string, Record[]>();
  for (const r of records) {
    for (const name of [r.person, r.relatedPerson]) {
      if (!name) continue;
      const key = normalizeText(name);
      if (!key) continue;
      const bucket = map.get(key) ?? [];
      bucket.push(r);
      map.set(key, bucket);
    }
  }
  return map;
}

export function groupRecordsByLocation(records: Record[]): Map<string, Record[]> {
  const map = new Map<string, Record[]>();
  for (const r of records) {
    if (!r.location) continue;
    const key = normalizeText(r.location);
    if (!key) continue;
    const bucket = map.get(key) ?? [];
    bucket.push(r);
    map.set(key, bucket);
  }
  return map;
}

/** Unique, case-insensitive list of non-null values with original casing. */
export function uniquePreserveCase(
  values: Array<string | null | undefined>,
): string[] {
  const seen = new Map<string, string>();
  for (const v of values) {
    if (!v) continue;
    const k = normalizeText(v);
    if (!seen.has(k)) seen.set(k, v);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}
