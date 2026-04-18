import type { InvestigationSummary } from "../utils/scoring";
import { formatDateTime } from "../utils/date";
import { SuspicionSummary } from "./SuspicionSummary";
import { ConnectionWeb } from "./ConnectionWeb";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { SourceBreakdown } from "./SourceBreakdown";

interface Props {
  summary: InvestigationSummary;
  onFilterPerson: (name: string) => void;
  onFilterLocation: (name: string) => void;
  onSelectRecord: (id: string) => void;
}

export function SummaryPanel({
  summary,
  onFilterPerson,
  onFilterLocation,
  onSelectRecord,
}: Props) {
  const last = summary.lastKnownSighting;
  const info = summary.lastSeenInfo;

  return (
    <aside className="summary">
      <header className="summary__header">
        <h2>Case: Missing Podo</h2>
        <p className="muted">{summary.totalRecords} records collected</p>
      </header>

      <section className="summary__block">
        <h3>Last known trace</h3>
        {last ? (
          <button
            type="button"
            className="summary__last"
            onClick={() => onSelectRecord(last.id)}
          >
            <div>
              <strong>{last.location ?? "Unknown location"}</strong>
              <span className="muted"> · {formatDateTime(last.timestamp)}</span>
            </div>
            {info && (
              <div className="summary__last-detail muted">
                <span>👤 Last seen with: <strong>{info.person}</strong></span>
                {info.location && <span> · 📍 {info.location}</span>}
              </div>
            )}
          </button>
        ) : (
          <p className="muted">No records reference Podo yet.</p>
        )}
      </section>

      {summary.podoAliases.length > 1 && (
        <section className="summary__block">
          <h3>Known Aliases</h3>
          <ul className="tag-list">
            {summary.podoAliases.map((alias) => (
              <li key={alias}>
                <span className="tag tag--alias">🐾 {alias}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {summary.topLocations.length > 0 && (
        <section className="summary__block">
          <h3>Recurring locations</h3>
          <ul className="tag-list">
            {summary.topLocations.map((l) => (
              <li key={l.name}>
                <button
                  type="button"
                  className="tag"
                  onClick={() => onFilterLocation(l.name)}
                >
                  {l.name} <span className="muted">· {l.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SourceBreakdown
        data={summary.sourceBreakdown}
        total={summary.totalRecords}
      />

      <ConnectionWeb
        connections={summary.podoConnections}
        onFilterPerson={onFilterPerson}
      />

      <ActivityHeatmap data={summary.hourlyActivity} />

      <SuspicionSummary summary={summary} onSelectPerson={onFilterPerson} />
    </aside>
  );
}
