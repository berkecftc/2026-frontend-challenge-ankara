import type { Record } from "../types";
import { compareTimestampsDesc } from "./date";
import { normalizeText } from "./filters";
import { groupRecordsByLocation, groupRecordsByPerson } from "./grouping";

export interface PersonStat {
  name: string;
  appearances: number;
  sightingCount: number;
  tipMentions: number;
  tipReliabilitySum: number;
  nearPodo: number;
  score: number;
}

export interface LocationStat {
  name: string;
  count: number;
}

export interface InvestigationSummary {
  totalRecords: number;
  lastKnownSighting: Record | null;
  lastSeenWith: string | null;
  topLocations: LocationStat[];
  topPeople: PersonStat[];
  podoAliases: string[];
}

const PODO_PATTERN = /\bpodo\b/i;

function isPodo(name: string | null): boolean {
  return !!name && PODO_PATTERN.test(name);
}

export function computeSuspicionSummary(records: Record[]): InvestigationSummary {
  const byPerson = groupRecordsByPerson(records);
  const byLocation = groupRecordsByLocation(records);

  const podoRecords = records.filter(
    (r) => isPodo(r.person) || isPodo(r.relatedPerson),
  );
  const sortedPodo = [...podoRecords].sort((a, b) =>
    compareTimestampsDesc(a.timestamp, b.timestamp),
  );
  const lastKnownSighting =
    sortedPodo.find(
      (r) => r.sourceType === "sighting" || r.sourceType === "checkin",
    ) ?? sortedPodo[0] ?? null;

  const lastSeenWith = extractLastSeenWith(lastKnownSighting);
  const nearPodoIds = new Set(podoRecords.map((r) => r.id));

  const personStats: PersonStat[] = [];
  for (const [key, bucket] of byPerson) {
    if (PODO_PATTERN.test(key)) continue;

    const name =
      bucket.find((r) => normalizeText(r.person) === key)?.person ??
      bucket.find((r) => normalizeText(r.relatedPerson) === key)?.relatedPerson ??
      key;

    const appearances = bucket.length;
    const sightingCount = bucket.filter((r) => r.sourceType === "sighting").length;
    const tips = bucket.filter((r) => r.sourceType === "tip");
    const tipMentions = tips.length;
    const tipReliabilitySum = tips.reduce(
      (sum, t) => sum + (t.reliability ?? 0.3),
      0,
    );
    const nearPodo = bucket.filter((r) => nearPodoIds.has(r.id)).length;

    const score =
      appearances * 1 +
      sightingCount * 2 +
      tipReliabilitySum * 3 +
      nearPodo * 2;

    personStats.push({
      name: name ?? key,
      appearances,
      sightingCount,
      tipMentions,
      tipReliabilitySum,
      nearPodo,
      score,
    });
  }

  personStats.sort((a, b) => b.score - a.score);

  const locationStats: LocationStat[] = Array.from(byLocation.entries())
    .map(([key, bucket]) => {
      const display =
        bucket.find((r) => r.location && normalizeText(r.location) === key)
          ?.location ?? key;
      return { name: display ?? key, count: bucket.length };
    })
    .sort((a, b) => b.count - a.count);

  const podoAliases = Array.from(
    new Set(
      podoRecords
        .flatMap((r) => [r.person, r.relatedPerson])
        .filter((n): n is string => !!n && isPodo(n)),
    ),
  );

  return {
    totalRecords: records.length,
    lastKnownSighting,
    lastSeenWith,
    topLocations: locationStats.slice(0, 5),
    topPeople: personStats.slice(0, 5),
    podoAliases,
  };
}

function extractLastSeenWith(record: Record | null): string | null {
  if (!record) return null;
  if (isPodo(record.person)) return record.relatedPerson;
  if (isPodo(record.relatedPerson)) return record.person;
  return record.relatedPerson ?? record.person;
}
