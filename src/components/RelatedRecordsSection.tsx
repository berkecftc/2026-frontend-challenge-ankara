import type { RelatedRecord } from "../utils/linking";
import { formatRelative } from "../utils/date";
import { SourceBadge } from "./SourceBadge";

interface Props {
  related: RelatedRecord[];
  onSelect: (id: string) => void;
}

export function RelatedRecordsSection({ related, onSelect }: Props) {
  if (related.length === 0) {
    return (
      <section className="related">
        <h3>Linked records</h3>
        <p className="muted">
          No other records are linked to this one. It may be an isolated clue.
        </p>
      </section>
    );
  }

  return (
    <section className="related">
      <h3>Linked records ({related.length})</h3>
      <ul className="related__list">
        {related.map(({ record, reasons, score }) => (
          <li
            key={record.id}
            className="related__item"
            onClick={() => onSelect(record.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(record.id);
              }
            }}
          >
            <div className="related__row">
              <SourceBadge sourceType={record.sourceType} />
              <span className="related__score" title="Link strength">
                link {score}
              </span>
              <span className="related__time">
                {formatRelative(record.timestamp)}
              </span>
            </div>
            {record.content && (
              <p className="related__content">{record.content}</p>
            )}
            <ul className="related__reasons">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
