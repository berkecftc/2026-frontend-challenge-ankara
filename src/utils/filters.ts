import type { Filters, Record } from "../types";
import { normalizeText } from "./string";
import { normalizeTurkish } from "./fuzzy";

export { normalizeText };

/**
 * Kaydın serbest metin sorgusunu (kişi/konum/içerik) karşılayıp karşılamadığını döndürür.
 *
 * Türkçe karakter normalizasyonu ile birlikte çalışır:
 * "çiçek" araması "cicek" ile de eşleşir.
 */
export function matchesQuery(record: Record, query: string): boolean {
  const q = query.trim();
  if (!q) return true;

  const normalizedQ = normalizeTurkish(q);

  const haystack = [
    record.person,
    record.relatedPerson,
    record.location,
    record.content,
  ]
    .filter(Boolean)
    .join(" ");

  if (haystack.toLowerCase().includes(q.toLowerCase())) return true;

  const normalizedHaystack = normalizeTurkish(haystack);
  if (normalizedHaystack.includes(normalizedQ)) return true;

  return false;
}

/** Kaydın tüm aktif filtreleri karşılayıp karşılamadığını döndürür. */
export function matchesFilters(record: Record, filters: Filters): boolean {
  if (filters.sourceTypes.size > 0 && !filters.sourceTypes.has(record.sourceType)) {
    return false;
  }

  if (filters.person) {
    const target = normalizeText(filters.person);
    const personMatches =
      normalizeText(record.person) === target ||
      normalizeText(record.relatedPerson) === target;
    if (!personMatches) return false;
  }

  if (filters.location) {
    if (normalizeText(record.location) !== normalizeText(filters.location)) {
      return false;
    }
  }

  if (filters.minReliability !== null) {
    if (record.sourceType !== "tip") return false;
    if ((record.reliability ?? 0) < filters.minReliability) return false;
  }

  return true;
}

/** Arama ve filtreleri tek bir geçişte uygular. */
export function filterRecords(
  records: Record[],
  query: string,
  filters: Filters,
): Record[] {
  return records.filter(
    (r) => matchesQuery(r, query) && matchesFilters(r, filters),
  );
}

export const EMPTY_FILTERS: Filters = {
  sourceTypes: new Set(),
  person: null,
  location: null,
  minReliability: null,
};
