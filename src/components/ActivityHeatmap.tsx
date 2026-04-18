import type { HourlyActivity } from "../utils/scoring";

interface Props {
  data: HourlyActivity[];
}

/**
 * 24 saatlik aktivite dağılımını bar chart olarak gösterir.
 * En yoğun saatler kırmızı ile vurgulanır.
 */
export function ActivityHeatmap({ data }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalEvents = data.reduce((sum, d) => sum + d.count, 0);

  if (totalEvents === 0) return null;

  const peakHours = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .filter((d) => d.count > 0);

  return (
    <section className="activity-heatmap">
      <h3>Activity by Hour</h3>
      <p className="muted activity-heatmap__hint">
        Peak hours:{" "}
        {peakHours
          .map((d) => `${String(d.hour).padStart(2, "0")}:00`)
          .join(", ")}
      </p>
      <div className="activity-heatmap__chart">
        {data.map((d) => {
          const height = d.count > 0 ? Math.max(4, (d.count / maxCount) * 100) : 0;
          const isPeak = peakHours.some((p) => p.hour === d.hour);
          return (
            <div
              key={d.hour}
              className="activity-heatmap__bar-wrapper"
              title={`${String(d.hour).padStart(2, "0")}:00 — ${d.count} event${d.count !== 1 ? "s" : ""}`}
            >
              <div
                className={`activity-heatmap__bar ${isPeak ? "is-peak" : ""}`}
                style={{ height: `${height}%` }}
              />
              {d.hour % 6 === 0 && (
                <span className="activity-heatmap__label">
                  {String(d.hour).padStart(2, "0")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
