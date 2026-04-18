import type { TimelineEvent as TEvent } from "../utils/timeline";
import { SourceBadge } from "./SourceBadge";

interface Props {
  event: TEvent;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Tek bir timeline noktasını render eder.
 * Sol tarafta zaman + kaynak renk çizgisi, sağda içerik.
 */
export function TimelineEventCard({ event, isSelected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`tl-event ${isSelected ? "is-selected" : ""}`}
      onClick={() => onSelect(event.id)}
    >
      <div className="tl-event__time">
        <span className="tl-event__clock">{event.time ?? "—"}</span>
        <span className={`tl-event__dot tl-event__dot--${event.sourceType}`} />
      </div>

      <div className="tl-event__body">
        <div className="tl-event__top">
          <SourceBadge sourceType={event.sourceType} />
          {event.location && (
            <span className="tl-event__location">📍 {event.location}</span>
          )}
        </div>
        <p className="tl-event__summary">{event.summary}</p>
        {event.record.content && (
          <p className="tl-event__content muted">
            {truncate(event.record.content, 120)}
          </p>
        )}
        <div className="tl-event__people">
          {event.person && (
            <span className="tl-event__person-tag">👤 {event.person}</span>
          )}
          {event.relatedPerson && (
            <span className="tl-event__person-tag">👤 {event.relatedPerson}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}
