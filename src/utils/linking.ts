import type { Record } from "../types";
import { normalizeText } from "./filters";
import { fuzzyMatch } from "./fuzzy";

export interface RelatedRecord {
  record: Record;
  score: number;
  reasons: string[];
}

/**
 * Seçili kayıtla ilişkili kayıtları bulur ve puana göre sıralar.
 *
 * Puanlama:
 *  +3  tam kişi eşleşmesi (person)
 *  +1.5 fuzzy kişi eşleşmesi (yakın yazım)
 *  +2  ilgili kişi eşleşmesi (relatedPerson) — tam
 *  +1  ilgili kişi fuzzy eşleşmesi
 *  +2  aynı konum
 *  +1  içerikte kişi adı geçmesi
 */
export function getRelatedRecords(
  selected: Record,
  all: Record[],
  limit = 20,
): RelatedRecord[] {
  const selP = normalizeText(selected.person);
  const selRP = normalizeText(selected.relatedPerson);
  const selLoc = normalizeText(selected.location);
  const selPeople = [selP, selRP].filter(Boolean);

  const results: RelatedRecord[] = [];

  for (const r of all) {
    if (r.id === selected.id) continue;

    const reasons: string[] = [];
    let score = 0;

    const p = normalizeText(r.person);
    const rp = normalizeText(r.relatedPerson);
    const loc = normalizeText(r.location);
    const content = normalizeText(r.content);

    if (selP) {
      if (p === selP || rp === selP) {
        score += 3;
        reasons.push(`Involves ${selected.person}`);
      } else if (fuzzyMatch(p, selP) || fuzzyMatch(rp, selP)) {
        score += 1.5;
        reasons.push(`≈ Similar to ${selected.person}`);
      }
    }

    if (selRP) {
      if (p === selRP || rp === selRP) {
        score += 2;
        reasons.push(`Involves ${selected.relatedPerson}`);
      } else if (fuzzyMatch(p, selRP) || fuzzyMatch(rp, selRP)) {
        score += 1;
        reasons.push(`≈ Similar to ${selected.relatedPerson}`);
      }
    }

    if (selLoc && loc === selLoc) {
      score += 2;
      reasons.push(`Same location: ${selected.location}`);
    }

    for (const name of selPeople) {
      if (!name) continue;
      if (content && content.includes(name)) {
        score += 1;
        reasons.push(`Content mentions ${name}`);
        break;
      }
    }

    if (score > 0) results.push({ record: r, score, reasons });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
