import type { Record } from "../types";
import { normalizeText } from "./filters";
import { normalizeTurkish, levenshtein, buildFuzzyGroups } from "./fuzzy";

/**
 * Kayıtları kişi bazında gruplar (büyük/küçük harf + Türkçe karakter duyarsız).
 *
 * Fuzzy eşleştirme ile benzer isimleri (ör. "Ayşe" ve "ayse") aynı gruba toplar.
 * Eşik: 0.25 (kısa isimlerde 1 harf farkına kadar tolerans).
 */
export function groupRecordsByPerson(records: Record[]): Map<string, Record[]> {
  const map = new Map<string, Record[]>();
  const canonicalKeys = new Map<string, string>();

  for (const r of records) {
    for (const name of [r.person, r.relatedPerson]) {
      if (!name) continue;
      const key = normalizeText(name);
      if (!key) continue;

      const resolvedKey = resolveCanonical(key, canonicalKeys, 0.4);
      const bucket = map.get(resolvedKey) ?? [];
      bucket.push(r);
      map.set(resolvedKey, bucket);
    }
  }
  return map;
}

export function groupRecordsByLocation(records: Record[]): Map<string, Record[]> {
  const map = new Map<string, Record[]>();
  const canonicalKeys = new Map<string, string>();

  for (const r of records) {
    if (!r.location) continue;
    const key = normalizeText(r.location);
    if (!key) continue;

    const resolvedKey = resolveCanonical(key, canonicalKeys, 0.3);
    const bucket = map.get(resolvedKey) ?? [];
    bucket.push(r);
    map.set(resolvedKey, bucket);
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

/**
 * Benzer isimleri (fuzzy match) tek bir kanonik isimde birleştirir.
 */
export function uniqueFuzzy(
  values: Array<string | null | undefined>,
  threshold = 0.4,
): string[] {
  const nonNull = values.filter((v): v is string => !!v);
  const groups = buildFuzzyGroups(nonNull, threshold);
  return Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));
}


/**
 * Verilen key'in mevcut kanonik anahtarlar arasında fuzzy eşleşeni var mı kontrol eder.
 * Varsa mevcut kanonik key'i döndürür, yoksa yeni kanonik key olarak kaydeder.
 */
function resolveCanonical(
  key: string,
  canonicalKeys: Map<string, string>,
  threshold: number,
): string {
  if (canonicalKeys.has(key)) return canonicalKeys.get(key)!;

  const normKey = normalizeTurkish(key);

  for (const [existingKey, canonicalKey] of canonicalKeys) {
    const normExisting = normalizeTurkish(existingKey);
    const maxLen = Math.max(normKey.length, normExisting.length);
    if (maxLen === 0) continue;

    const dist = levenshtein(normKey, normExisting);
    if (dist / maxLen <= threshold) {
      canonicalKeys.set(key, canonicalKey);
      return canonicalKey;
    }
  }

  canonicalKeys.set(key, key);
  return key;
}
