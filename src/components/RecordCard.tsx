import type { Record } from "../types";
import { formatRelative } from "../utils/date";
import { SourceBadge } from "./SourceBadge";

interface Props {
  record: Record;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function RecordCard({ record, isSelected, onSelect }: Props) {
  const headline = buildHeadline(record);
  return (
    <li
      className={`record-card ${isSelected ? "is-selected" : ""}`}
      data-record-id={record.id}
      onClick={() => onSelect(record.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(record.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="record-card__top">
        <SourceBadge sourceType={record.sourceType} />
        <span className="record-card__time" title={record.timestamp ?? ""}>
          {formatRelative(record.timestamp)}
        </span>
      </div>
      <h4 className="record-card__headline">{headline}</h4>
      {record.location && (
        <div className="record-card__meta">
          <span className="meta-tag">@ {record.location}</span>
        </div>
      )}
      {record.content && (
        <p className="record-card__content">{truncate(record.content, 140)}</p>
      )}
      {record.sourceType === "tip" && record.reliability !== null && (
        <div className="reliability">
          <span
            className="reliability__bar"
            style={{ width: `${Math.round(record.reliability * 100)}%` }}
          />
          <span className="reliability__label">
            {Math.round(record.reliability * 100)}% reliable
          </span>
        </div>
      )}
    </li>
  );
}

function buildHeadline(r: Record): string {
  switch (r.sourceType) {
    case "checkin":
      return `${r.person ?? "Someone"} checked in${r.location ? ` at ${r.location}` : ""}`;
    case "message":
      return `${r.person ?? "Someone"} → ${r.relatedPerson ?? "someone"}`;
    case "sighting":
      return `${r.person ?? "Someone"} seen${r.relatedPerson ? ` with ${r.relatedPerson}` : ""}`;
    case "note":
      return `Note${r.person ? ` by ${r.person}` : ""}${r.relatedPerson ? ` about ${r.relatedPerson}` : ""}`;
    case "tip":
      return `Anonymous tip${r.person ? ` about ${r.person}` : ""}`;
  }
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}
