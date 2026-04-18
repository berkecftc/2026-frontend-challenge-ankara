import type { InvestigationSummary } from "../utils/scoring";

interface Props {
  summary: InvestigationSummary;
  onSelectPerson: (name: string) => void;
}

export function SuspicionSummary({ summary, onSelectPerson }: Props) {
  if (summary.topPeople.length === 0) {
    return null;
  }

  const maxScore = summary.topPeople[0]?.score ?? 1;

  return (
    <section className="suspicion">
      <h3>Most suspicious</h3>
      <p className="muted suspicion__hint">
        Score combines appearances, sightings, and tip reliability.
      </p>
      <ol className="suspicion__list">
        {summary.topPeople.map((p, i) => (
          <li key={p.name}>
            <button
              type="button"
              className="suspicion__row"
              onClick={() => onSelectPerson(p.name)}
              title="Filter by this person"
            >
              <span className="suspicion__rank">#{i + 1}</span>
              <span className="suspicion__name">{p.name}</span>
              <span className="suspicion__meter">
                <span
                  className="suspicion__meter-fill"
                  style={{ width: `${(p.score / maxScore) * 100}%` }}
                />
              </span>
              <span className="suspicion__score">{p.score.toFixed(1)}</span>
            </button>
            <div className="suspicion__breakdown muted">
              {p.appearances} records · {p.sightingCount} sightings ·{" "}
              {p.tipMentions} tips
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
