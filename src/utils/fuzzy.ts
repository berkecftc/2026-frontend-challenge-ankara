/**
 * Fuzzy string matching utilities.
 *
 * Levenshtein distance tabanlı yaklaşık eşleştirme ve Türkçe karakter
 * normalizasyonu sağlar. Harici bağımlılık gerektirmez.
 */


const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

const TR_REGEX = /[çÇğĞıİöÖşŞüÜ]/g;

/** Türkçe karakterleri ASCII karşılıklarına dönüştürür ve küçük harfe çevirir. */
export function normalizeTurkish(value: string): string {
  return value
    .replace(TR_REGEX, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .trim();
}


/**
 * İki string arasındaki Levenshtein düzenleme mesafesini hesaplar.
 * Wagner–Fischer algoritması (O(m×n) zaman, O(min(m,n)) bellek).
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  if (a.length > b.length) [a, b] = [b, a];

  const aLen = a.length;
  const bLen = b.length;

  let prev = new Array<number>(aLen + 1);
  let curr = new Array<number>(aLen + 1);

  for (let i = 0; i <= aLen; i++) prev[i] = i;

  for (let j = 1; j <= bLen; j++) {
    curr[0] = j;
    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,
        curr[i - 1] + 1,
        prev[i - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[aLen];
}


/**
 * İki string'in yaklaşık olarak eşleşip eşleşmediğini döndürür.
 *
 * Türkçe karakter normalizasyonu uyguladıktan sonra Levenshtein mesafesini
 * hesaplar ve bunu uzunluğa oranlar. Eşik varsayılan olarak 0.3'tür
 * (en fazla %30 düzenleme mesafesi).
 */
export function fuzzyMatch(
  a: string | null | undefined,
  b: string | null | undefined,
  threshold = 0.3,
): boolean {
  if (!a || !b) return false;

  const na = normalizeTurkish(a);
  const nb = normalizeTurkish(b);

  if (na === nb) return true;
  if (!na || !nb) return false;

  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);

  return dist / maxLen <= threshold;
}

/**
 * Verilen aday listesinden en iyi eşleşeni bulur.
 * Tam eşleşme varsa onu döndürür; yoksa eşik altındaki en düşük mesafeyi seçer.
 */
export function findBestMatch(
  query: string | null | undefined,
  candidates: string[],
  threshold = 0.3,
): string | null {
  if (!query) return null;

  const nq = normalizeTurkish(query);
  if (!nq) return null;

  let bestCandidate: string | null = null;
  let bestDist = Infinity;

  for (const candidate of candidates) {
    const nc = normalizeTurkish(candidate);
    if (!nc) continue;

    if (nq === nc) return candidate;

    const dist = levenshtein(nq, nc);
    const maxLen = Math.max(nq.length, nc.length);
    const ratio = dist / maxLen;

    if (ratio <= threshold && dist < bestDist) {
      bestDist = dist;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

/**
 * Bir listedeki string'leri fuzzy olarak gruplar.
 * Aynı kişinin farklı yazımlarını tek bir "kanonik isim" altında toplar.
 *
 * Döndürülen Map: kanonik isim → aynı gruba düşen tüm varyasyonlar.
 */
export function buildFuzzyGroups(
  names: string[],
  threshold = 0.3,
): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();
  const canonical = new Map<string, string>();

  for (const name of names) {
    const norm = normalizeTurkish(name);
    if (!norm) continue;

    let matched = false;
    for (const [existingNorm, groupKey] of canonical) {
      if (norm === existingNorm || levenshtein(norm, existingNorm) / Math.max(norm.length, existingNorm.length) <= threshold) {
        groups.get(groupKey)!.add(name);
        canonical.set(norm, groupKey);
        matched = true;
        break;
      }
    }

    if (!matched) {
      canonical.set(norm, name);
      groups.set(name, new Set([name]));
    }
  }

  return groups;
}
