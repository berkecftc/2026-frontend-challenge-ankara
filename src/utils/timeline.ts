/**
 * Podo'nun hareketlerini kronolojik olarak gruplandıran yardımcı modül.
 */

import type { Record, SourceType } from "../types";
import { compareTimestampsDesc } from "./date";

export interface TimelineEvent {
  id: string;
  record: Record;
  date: string;          // "YYYY-MM-DD" veya "Unknown"
  time: string | null;   // "HH:MM" veya null
  sourceType: SourceType;
  person: string | null;
  relatedPerson: string | null;
  location: string | null;
  summary: string;
}

export interface TimelineDay {
  date: string;          // "YYYY-MM-DD" veya "Unknown"
  label: string;         // "Apr 15, 2026" gibi okunabilir etiket
  events: TimelineEvent[];
}

/**
 * Kayıtlardan timeline verisini oluşturur.
 * İsteğe bağlı olarak belirli bir kişiyle filtrelenebilir.
 * Sonuç tarihe göre yeniden eskiye sıralıdır.
 */
export function buildTimeline(
  records: Record[],
  personFilter?: string | null,
): TimelineDay[] {
  let filtered = records;

  if (personFilter) {
    const p = personFilter.toLowerCase();
    filtered = records.filter(
      (r) =>
        r.person?.toLowerCase().includes(p) ||
        r.relatedPerson?.toLowerCase().includes(p),
    );
  }

  const sorted = [...filtered].sort((a, b) =>
    compareTimestampsDesc(a.timestamp, b.timestamp),
  );

  const events: TimelineEvent[] = sorted.map((r) => ({
    id: r.id,
    record: r,
    date: extractDate(r.timestamp),
    time: extractTime(r.timestamp),
    sourceType: r.sourceType,
    person: r.person,
    relatedPerson: r.relatedPerson,
    location: r.location,
    summary: buildEventSummary(r),
  }));

  const dayMap = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const bucket = dayMap.get(ev.date) ?? [];
    bucket.push(ev);
    dayMap.set(ev.date, bucket);
  }

  const days: TimelineDay[] = Array.from(dayMap.entries()).map(
    ([date, evts]) => ({
      date,
      label: formatDayLabel(date),
      events: evts,
    }),
  );

  return days;
}


function extractDate(iso: string | null): string {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toISOString().slice(0, 10);
}

function extractTime(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDayLabel(date: string): string {
  if (date === "Unknown") return "Unknown date";
  const d = new Date(date + "T00:00:00");
  if (Number.isNaN(d.getTime())) return date;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (date === todayStr) return "Today";
  if (date === yesterdayStr) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildEventSummary(r: Record): string {
  switch (r.sourceType) {
    case "checkin":
      return `${r.person ?? "Someone"} checked in${r.location ? ` at ${r.location}` : ""}`;
    case "message":
      return `${r.person ?? "Someone"} → ${r.relatedPerson ?? "someone"}`;
    case "sighting":
      return `${r.person ?? "Someone"} seen${r.relatedPerson ? ` with ${r.relatedPerson}` : ""}${r.location ? ` at ${r.location}` : ""}`;
    case "note":
      return `Note${r.person ? ` by ${r.person}` : ""}${r.relatedPerson ? ` about ${r.relatedPerson}` : ""}`;
    case "tip":
      return `Anonymous tip${r.person ? ` about ${r.person}` : ""}`;
  }
}
