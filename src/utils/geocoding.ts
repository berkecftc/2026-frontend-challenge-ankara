/**
 * Statik geocoding sözlüğü.
 *
 * Jotform verisindeki konum adlarını enlem/boylam koordinatlarına eşler.
 * API kotası kullanmamak için sabit sözlük yaklaşımı tercih edilmiştir.
 * Ankara bölgesi ve Türkiye genelindeki yaygın konumları içerir.
 */

import { normalizeTurkish } from "./fuzzy";

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Bilinen konumların koordinat sözlüğü.
 * Anahtar: normalize edilmiş konum adı (küçük harf, trim).
 */
const LOCATION_DB: Record<string, Coordinates> = {

  "ankara kalesi": { lat: 39.9408, lng: 32.8644 },
  "atakule": { lat: 39.8870, lng: 32.8597 },
  "cermodern": { lat: 39.9300, lng: 32.8487 },
  "hamamönü": { lat: 39.9420, lng: 32.8700 },
  "hamamonu": { lat: 39.9420, lng: 32.8700 },
  "kuğulu park": { lat: 39.9067, lng: 32.8608 },
  "kugulu park": { lat: 39.9067, lng: 32.8608 },
  "seğmenler parkı": { lat: 39.8960, lng: 32.8564 },
  "segmenler parki": { lat: 39.8960, lng: 32.8564 },
  "tunalı hilmi caddesi": { lat: 39.9073, lng: 32.8615 },
  "tunali hilmi caddesi": { lat: 39.9073, lng: 32.8615 },
  "tunalı hilmi": { lat: 39.9073, lng: 32.8615 },
  "tunali hilmi": { lat: 39.9073, lng: 32.8615 },


  "ankara": { lat: 39.9334, lng: 32.8597 },
  "çankaya": { lat: 39.9032, lng: 32.8644 },
  "cankaya": { lat: 39.9032, lng: 32.8644 },
  "kızılay": { lat: 39.9208, lng: 32.8541 },
  "kizilay": { lat: 39.9208, lng: 32.8541 },
  "ulus": { lat: 39.9405, lng: 32.8543 },
  "tunalı": { lat: 39.9073, lng: 32.8615 },
  "tunali": { lat: 39.9073, lng: 32.8615 },
  "bahçelievler": { lat: 39.9189, lng: 32.8225 },
  "bahcelievler": { lat: 39.9189, lng: 32.8225 },
  "keçiören": { lat: 39.9687, lng: 32.8687 },
  "kecioren": { lat: 39.9687, lng: 32.8687 },
  "etimesgut": { lat: 39.9441, lng: 32.6778 },
  "yenimahalle": { lat: 39.9654, lng: 32.8093 },
  "mamak": { lat: 39.9300, lng: 32.9130 },
  "sincan": { lat: 39.9690, lng: 32.5833 },
  "altındağ": { lat: 39.9565, lng: 32.8677 },
  "altindag": { lat: 39.9565, lng: 32.8677 },
  "batıkent": { lat: 39.9714, lng: 32.7267 },
  "batikent": { lat: 39.9714, lng: 32.7267 },
  "dikmen": { lat: 39.8923, lng: 32.8501 },
  "gölbaşı": { lat: 39.7871, lng: 32.8055 },
  "golbasi": { lat: 39.7871, lng: 32.8055 },
  "beşevler": { lat: 39.9233, lng: 32.8332 },
  "besevler": { lat: 39.9233, lng: 32.8332 },
  "ayrancı": { lat: 39.9040, lng: 32.8663 },
  "ayranci": { lat: 39.9040, lng: 32.8663 },
  "emek": { lat: 39.9213, lng: 32.8086 },
  "balgat": { lat: 39.9074, lng: 32.8373 },
  "eryaman": { lat: 39.9503, lng: 32.6486 },
  "bilkent": { lat: 39.8683, lng: 32.7502 },
  "incek": { lat: 39.8533, lng: 32.7464 },
  "oran": { lat: 39.8762, lng: 32.8222 },
  "çayyolu": { lat: 39.8731, lng: 32.7410 },
  "cayyolu": { lat: 39.8731, lng: 32.7410 },
  "söğütözü": { lat: 39.9075, lng: 32.7908 },
  "sogutozu": { lat: 39.9075, lng: 32.7908 },
  "tandoğan": { lat: 39.9200, lng: 32.8353 },
  "tandogan": { lat: 39.9200, lng: 32.8353 },
  "demetevler": { lat: 39.9520, lng: 32.7875 },
  "ostim": { lat: 39.9617, lng: 32.7632 },
  "kavaklıdere": { lat: 39.9014, lng: 32.8614 },
  "kavaklidere": { lat: 39.9014, lng: 32.8614 },
  "gop": { lat: 39.9098, lng: 32.8560 },
  "gaziosmanpaşa": { lat: 39.9098, lng: 32.8560 },
  "gaziosmanpasa": { lat: 39.9098, lng: 32.8560 },
  "pursaklar": { lat: 40.0303, lng: 32.8935 },
  "polatlı": { lat: 39.5844, lng: 32.1468 },
  "polatli": { lat: 39.5844, lng: 32.1468 },
  "çubuk": { lat: 40.2407, lng: 33.0310 },
  "cubuk": { lat: 40.2407, lng: 33.0310 },
  "akyurt": { lat: 40.1300, lng: 33.0867 },


  "anıtkabir": { lat: 39.9254, lng: 32.8369 },
  "anitkabir": { lat: 39.9254, lng: 32.8369 },
  "gençlik parkı": { lat: 39.9377, lng: 32.8483 },
  "genclik parki": { lat: 39.9377, lng: 32.8483 },
  "eymir gölü": { lat: 39.8167, lng: 32.7675 },
  "eymir golu": { lat: 39.8167, lng: 32.7675 },
  "mogan gölü": { lat: 39.7833, lng: 32.7897 },
  "mogan golu": { lat: 39.7833, lng: 32.7897 },

  "anadolu medeniyetleri müzesi": { lat: 39.9376, lng: 32.8644 },
  "anadolu medeniyetleri muzesi": { lat: 39.9376, lng: 32.8644 },
  "etnografya müzesi": { lat: 39.9276, lng: 32.8556 },
  "etnografya muzesi": { lat: 39.9276, lng: 32.8556 },
  "csm sanat": { lat: 39.9161, lng: 32.8598 },

  "ankamall": { lat: 39.9305, lng: 32.8617 },
  "armada": { lat: 39.9045, lng: 32.8566 },
  "kentpark": { lat: 39.9195, lng: 32.7887 },
  "next level": { lat: 39.8800, lng: 32.8069 },
  "panora": { lat: 39.8769, lng: 32.8087 },
  "cepa": { lat: 39.9100, lng: 32.7960 },

  "atatürk bulvarı": { lat: 39.9220, lng: 32.8550 },
  "ataturk bulvari": { lat: 39.9220, lng: 32.8550 },
  "çankaya caddesi": { lat: 39.9020, lng: 32.8630 },
  "cankaya caddesi": { lat: 39.9020, lng: 32.8630 },
  "strazburg caddesi": { lat: 39.9177, lng: 32.8563 },

  "odtü": { lat: 39.8916, lng: 32.7826 },
  "odtu": { lat: 39.8916, lng: 32.7826 },
  "metu": { lat: 39.8916, lng: 32.7826 },
  "hacettepe": { lat: 39.8680, lng: 32.7340 },
  "ankara üniversitesi": { lat: 39.9377, lng: 32.8604 },
  "ankara universitesi": { lat: 39.9377, lng: 32.8604 },
  "gazi üniversitesi": { lat: 39.9202, lng: 32.8171 },
  "gazi universitesi": { lat: 39.9202, lng: 32.8171 },
  "başkent üniversitesi": { lat: 39.8674, lng: 32.7510 },
  "baskent universitesi": { lat: 39.8674, lng: 32.7510 },


  "istanbul": { lat: 41.0082, lng: 28.9784 },
  "izmir": { lat: 38.4192, lng: 27.1287 },
  "antalya": { lat: 36.8969, lng: 30.7133 },
  "bursa": { lat: 40.1828, lng: 29.0665 },
  "konya": { lat: 37.8746, lng: 32.4932 },
  "eskişehir": { lat: 39.7767, lng: 30.5206 },
  "eskisehir": { lat: 39.7767, lng: 30.5206 },


  "park": { lat: 39.9200, lng: 32.8541 },
  "cafe": { lat: 39.9100, lng: 32.8600 },
  "market": { lat: 39.9150, lng: 32.8550 },
  "okul": { lat: 39.9250, lng: 32.8500 },
  "hastane": { lat: 39.9300, lng: 32.8400 },
  "hospital": { lat: 39.9300, lng: 32.8400 },
};

/**
 * Konum adını koordinatlara çözümler.
 * 3 aşamalı eşleştirme:
 *   1. Tam eşleşme (lowercase)
 *   2. Türkçe karakter normalize edilmiş eşleşme
 *   3. Alt-dizge eşleşmesi
 */
export function resolveCoordinates(location: string | null): Coordinates | null {
  if (!location) return null;

  const norm = location.toLowerCase().trim();
  if (!norm) return null;

  if (LOCATION_DB[norm]) return LOCATION_DB[norm];

  const ascii = normalizeTurkish(norm);
  if (ascii !== norm && LOCATION_DB[ascii]) return LOCATION_DB[ascii];

  for (const [key, coords] of Object.entries(LOCATION_DB)) {
    if (normalizeTurkish(key) === ascii) return coords;
  }

  let bestMatch: { key: string; coords: Coordinates } | null = null;
  for (const [key, coords] of Object.entries(LOCATION_DB)) {
    const keyAscii = normalizeTurkish(key);
    if (
      norm.includes(key) || key.includes(norm) ||
      ascii.includes(keyAscii) || keyAscii.includes(ascii)
    ) {
      if (!bestMatch || key.length > bestMatch.key.length) {
        bestMatch = { key, coords };
      }
    }
  }
  if (bestMatch) return bestMatch.coords;

  return null;
}

/**
 * Birden çok konumu topluca çözümler.
 * Sadece koordinat bulunan konumları döndürür.
 */
export function resolveMultiple(
  locations: Array<string | null>,
): Map<string, Coordinates> {
  const result = new Map<string, Coordinates>();
  for (const loc of locations) {
    if (!loc) continue;
    const norm = loc.toLowerCase().trim();
    if (result.has(norm)) continue;
    const coords = resolveCoordinates(loc);
    if (coords) result.set(norm, coords);
  }
  return result;
}
