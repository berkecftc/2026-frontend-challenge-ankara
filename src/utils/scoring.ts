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

/** "Last seen with" bilgisini tarih ve konum detayıyla birlikte tutar. */
export interface LastSeenInfo {
  person: string;
  timestamp: string | null;
  location: string | null;
  recordId: string;
}

/** İki kişi arasındaki bağlantıyı temsil eder. */
export interface PersonConnection {
  personA: string;
  personB: string;
  sharedRecords: number;
  lastSeen: string | null;
  locations: string[];
}

/** Saatlik aktivite dağılımı. */
export interface HourlyActivity {
  hour: number;       // 0–23
  count: number;
}

export interface InvestigationSummary {
  totalRecords: number;
  lastKnownSighting: Record | null;
  lastSeenWith: string | null;
  /** Genişletilmiş "last seen with" — tarih ve konum bilgisiyle birlikte. */
  lastSeenInfo: LastSeenInfo | null;
  topLocations: LocationStat[];
  topPeople: PersonStat[];
  podoAliases: string[];
  /** Podo ile doğrudan temas kuran kişiler ve bağlantı detayları. */
  podoConnections: PersonConnection[];
  /** Saatlik aktivite dağılımı (0–23 saat). */
  hourlyActivity: HourlyActivity[];
  /** Kaynak tipi bazında dağılım. */
  sourceBreakdown: { sourceType: string; count: number }[];
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
  const lastSeenInfo = buildLastSeenInfo(lastKnownSighting);
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

  const podoConnections = buildPodoConnections(podoRecords);

  const hourlyActivity = computeHourlyActivity(records);

  const sourceBreakdown = computeSourceBreakdown(records);

  return {
    totalRecords: records.length,
    lastKnownSighting,
    lastSeenWith,
    lastSeenInfo,
    topLocations: locationStats.slice(0, 5),
    topPeople: personStats.slice(0, 5),
    podoAliases,
    podoConnections,
    hourlyActivity,
    sourceBreakdown,
  };
}


function extractLastSeenWith(record: Record | null): string | null {
  if (!record) return null;
  if (isPodo(record.person)) return record.relatedPerson;
  if (isPodo(record.relatedPerson)) return record.person;
  return record.relatedPerson ?? record.person;
}

function buildLastSeenInfo(record: Record | null): LastSeenInfo | null {
  if (!record) return null;
  const companion = isPodo(record.person) ? record.relatedPerson : record.person;
  if (!companion) return null;
  return {
    person: companion,
    timestamp: record.timestamp,
    location: record.location,
    recordId: record.id,
  };
}

/**
 * Podo kayıtlarından kişi bağlantı ağını çıkarır.
 * Her bağlantı: hangi kişi Podo ile birlikte görüldü, kaç kez, nerede.
 */
function buildPodoConnections(podoRecords: Record[]): PersonConnection[] {
  const connectionMap = new Map<string, {
    sharedRecords: number;
    lastSeen: string | null;
    locations: Set<string>;
  }>();

  for (const r of podoRecords) {
    const companion = isPodo(r.person) ? r.relatedPerson : r.person;
    if (!companion || isPodo(companion)) continue;

    const key = normalizeText(companion);
    if (!key) continue;

    const existing = connectionMap.get(key) ?? {
      sharedRecords: 0,
      lastSeen: null,
      locations: new Set(),
    };

    existing.sharedRecords++;
    if (r.location) existing.locations.add(r.location);
    if (!existing.lastSeen || compareTimestampsDesc(existing.lastSeen, r.timestamp) > 0) {
      existing.lastSeen = r.timestamp;
    }

    connectionMap.set(key, existing);
  }

  const connections: PersonConnection[] = [];
  for (const [_key, data] of connectionMap) {
    const displayName = podoRecords.find((r) => {
      const comp = isPodo(r.person) ? r.relatedPerson : r.person;
      return comp && normalizeText(comp) === _key;
    });
    const personName = displayName
      ? (isPodo(displayName.person) ? displayName.relatedPerson : displayName.person) ?? _key
      : _key;

    connections.push({
      personA: "Podo",
      personB: personName,
      sharedRecords: data.sharedRecords,
      lastSeen: data.lastSeen,
      locations: Array.from(data.locations),
    });
  }

  connections.sort((a, b) => b.sharedRecords - a.sharedRecords);
  return connections.slice(0, 8);
}

/**
 * Kayıtların saatlik dağılımını hesaplar (0–23 saat).
 */
function computeHourlyActivity(records: Record[]): HourlyActivity[] {
  const hours = new Array(24).fill(0) as number[];

  for (const r of records) {
    if (!r.timestamp) continue;
    const d = new Date(r.timestamp);
    if (Number.isNaN(d.getTime())) continue;
    hours[d.getHours()]++;
  }

  return hours.map((count, hour) => ({ hour, count }));
}

/**
 * Kaynak tipi bazında dağılımı hesaplar.
 */
function computeSourceBreakdown(records: Record[]): { sourceType: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of records) {
    map.set(r.sourceType, (map.get(r.sourceType) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([sourceType, count]) => ({ sourceType, count }))
    .sort((a, b) => b.count - a.count);
}
