interface Props {
  data: { sourceType: string; count: number }[];
  total: number;
}

const SOURCE_COLORS: Record<string, string> = {
  checkin: "var(--src-checkin)",
  message: "var(--src-message)",
  sighting: "var(--src-sighting)",
  note: "var(--src-note)",
  tip: "var(--src-tip)",
};

const SOURCE_LABELS: Record<string, string> = {
  checkin: "Check-ins",
  message: "Messages",
  sighting: "Sightings",
  note: "Notes",
  tip: "Tips",
};

/**
 * Kaynak tipi bazında kayıt dağılımını görselleştirir.
 * Yatay çubuk grafik + sayılar.
 */
export function SourceBreakdown({ data, total }: Props) {
  if (data.length === 0) return null;

  return (
    <section className="source-breakdown">
      <h3>Source Breakdown</h3>
      <div className="source-breakdown__bars">
        {data.map((d) => {
          const pct = total > 0 ? (d.count / total) * 100 : 0;
          const color = SOURCE_COLORS[d.sourceType] ?? "var(--text-muted)";
          const label = SOURCE_LABELS[d.sourceType] ?? d.sourceType;

          return (
            <div key={d.sourceType} className="source-breakdown__row">
              <span className="source-breakdown__label">{label}</span>
              <div className="source-breakdown__track">
                <div
                  className="source-breakdown__fill"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <span className="source-breakdown__count">{d.count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
