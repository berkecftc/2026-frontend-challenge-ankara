import type { Record } from "../types";
import { formatDateTime } from "../utils/date";
import type { RelatedRecord } from "../utils/linking";
import { RelatedRecordsSection } from "./RelatedRecordsSection";
import { SourceBadge } from "./SourceBadge";

interface Props {
  record: Record | null;
  related: RelatedRecord[];
  onSelect: (id: string) => void;
}

export function DetailPanel({ record, related, onSelect }: Props) {
  if (!record) {
    return (
      <div className="detail detail--empty">
        <h2>Select a record</h2>
        <p className="muted">
          Pick a clue from the list on the left to inspect its details and
          linked evidence from other sources.
        </p>
      </div>
    );
  }

  return (
    <article className="detail">
      <header className="detail__header">
        <SourceBadge sourceType={record.sourceType} />
        <span className="detail__time">{formatDateTime(record.timestamp)}</span>
      </header>

      <dl className="detail__facts">
        {record.person && (
          <>
            <dt>Person</dt>
            <dd>{record.person}</dd>
          </>
        )}
        {record.relatedPerson && (
          <>
            <dt>
              {record.sourceType === "message" ? "Recipient" : "Related to"}
            </dt>
            <dd>{record.relatedPerson}</dd>
          </>
        )}
        {record.location && (
          <>
            <dt>Location</dt>
            <dd>{record.location}</dd>
          </>
        )}
        {record.sourceType === "tip" && record.reliability !== null && (
          <>
            <dt>Reliability</dt>
            <dd>{Math.round(record.reliability * 100)}%</dd>
          </>
        )}
      </dl>

      {record.content && (
        <section className="detail__content">
          <h3>Details</h3>
          <p>{record.content}</p>
        </section>
      )}

      <RelatedRecordsSection related={related} onSelect={onSelect} />
    </article>
  );
}
