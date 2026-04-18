import { useMemo, useState } from "react";
import type { Record } from "../types";
import { buildTimeline } from "../utils/timeline";
import { TimelineEventCard } from "./TimelineEvent";

interface Props {
  records: Record[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const FILTER_OPTIONS = [
  { value: "", label: "All records" },
  { value: "podo", label: "🐾 Podo only" },
] as const;

/**
 * Podo'nun hareketlerini kronolojik olarak görselleştiren dikey timeline.
 * Günlere gruplar, kişi filtreleme destekler.
 */
export function Timeline({ records, selectedId, onSelect }: Props) {
  const [personFilter, setPersonFilter] = useState<string>("");

  const days = useMemo(
    () => buildTimeline(records, personFilter || null),
    [records, personFilter],
  );

  const totalEvents = days.reduce((sum, d) => sum + d.events.length, 0);

  return (
    <div className="timeline">
      <header className="timeline__header">
        <div>
          <h2>Timeline</h2>
          <p className="muted">
            {totalEvents} event{totalEvents !== 1 ? "s" : ""} across{" "}
            {days.length} day{days.length !== 1 ? "s" : ""}
          </p>
        </div>
        <select
          className="timeline__filter"
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </header>

      {days.length === 0 ? (
        <div className="timeline__empty muted">
          <p>No events match the current filter.</p>
        </div>
      ) : (
        <div className="timeline__scroll">
          {days.map((day) => (
            <section key={day.date} className="timeline__day">
              <div className="timeline__day-header">
                <span className="timeline__day-label">{day.label}</span>
                <span className="timeline__day-count muted">
                  {day.events.length} event{day.events.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="timeline__events">
                {day.events.map((ev) => (
                  <TimelineEventCard
                    key={ev.id}
                    event={ev}
                    isSelected={ev.id === selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
