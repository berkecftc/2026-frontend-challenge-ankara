import type { PersonConnection } from "../utils/scoring";
import { formatRelative } from "../utils/date";

interface Props {
  connections: PersonConnection[];
  onFilterPerson: (name: string) => void;
}

/**
 * Podo ile doğrudan temas kuran kişilerin bağlantı haritası.
 * Her bağlantıyı görsel bir çizgi ile gösterir.
 */
export function ConnectionWeb({ connections, onFilterPerson }: Props) {
  if (connections.length === 0) return null;

  const maxShared = connections[0]?.sharedRecords ?? 1;

  return (
    <section className="connection-web">
      <h3>Podo's Contact Network</h3>
      <p className="muted connection-web__hint">
        People directly linked to Podo across all records.
      </p>
      <div className="connection-web__graph">
        <div className="connection-web__center">🐾 Podo</div>
        <ul className="connection-web__nodes">
          {connections.map((c) => {
            const strength = c.sharedRecords / maxShared;
            return (
              <li key={c.personB} className="connection-web__node">
                <button
                  type="button"
                  className="connection-web__person"
                  onClick={() => onFilterPerson(c.personB)}
                  title={`Filter records by ${c.personB}`}
                  style={{
                    borderColor: strengthColor(strength),
                    boxShadow: `0 0 ${Math.round(strength * 12)}px ${strengthColor(strength)}40`,
                  }}
                >
                  <span className="connection-web__name">{c.personB}</span>
                  <span className="connection-web__meta muted">
                    {c.sharedRecords} shared · {formatRelative(c.lastSeen)}
                  </span>
                  {c.locations.length > 0 && (
                    <span className="connection-web__locations muted">
                      📍 {c.locations.slice(0, 2).join(", ")}
                      {c.locations.length > 2 && ` +${c.locations.length - 2}`}
                    </span>
                  )}
                </button>
                <div
                  className="connection-web__line"
                  style={{
                    opacity: 0.3 + strength * 0.7,
                    height: `${Math.max(2, Math.round(strength * 4))}px`,
                    background: strengthColor(strength),
                  }}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function strengthColor(strength: number): string {
  if (strength > 0.7) return "#ff5c5c";
  if (strength > 0.4) return "#f59e0b";
  return "#64748b";
}
