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
          <div className="detail__fact-row">
            <dt>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Person
            </dt>
            <dd>{record.person}</dd>
          </div>
        )}
        {record.relatedPerson && (
          <div className="detail__fact-row">
            <dt>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {record.sourceType === "message" ? "Recipient" : "Related to"}
            </dt>
            <dd>{record.relatedPerson}</dd>
          </div>
        )}
        {record.location && (
          <div className="detail__fact-row">
            <dt>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Location
            </dt>
            <dd>{record.location}</dd>
          </div>
        )}
        {record.sourceType === "tip" && record.reliability !== null && (
          <div className="detail__fact-row">
            <dt>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Reliability
            </dt>
            <dd>{Math.round(record.reliability * 100)}%</dd>
          </div>
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
