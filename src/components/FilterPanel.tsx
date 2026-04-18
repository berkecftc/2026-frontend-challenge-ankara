import type { Filters, SourceType } from "../types";

const ALL_SOURCES: SourceType[] = [
  "checkin",
  "message",
  "sighting",
  "note",
  "tip",
];

const SOURCE_LABELS: { [K in SourceType]: string } = {
  checkin: "Check-ins",
  message: "Messages",
  sighting: "Sightings",
  note: "Notes",
  tip: "Tips",
};

interface Props {
  filters: Filters;
  people: string[];
  locations: string[];
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export function FilterPanel({
  filters,
  people,
  locations,
  onChange,
  onReset,
}: Props) {
  const toggleSource = (source: SourceType) => {
    const next = new Set(filters.sourceTypes);
    if (next.has(source)) next.delete(source);
    else next.add(source);
    onChange({ ...filters, sourceTypes: next });
  };

  return (
    <section className="filter-panel">
      <header className="filter-panel__header">
        <h3>Filters</h3>
        <button type="button" className="link-btn" onClick={onReset}>
          Reset
        </button>
      </header>

      <div className="filter-group">
        <span className="filter-label">Source</span>
        <div className="chip-row">
          {ALL_SOURCES.map((s) => {
            const active = filters.sourceTypes.has(s);
            return (
              <button
                key={s}
                type="button"
                className={`chip chip--${s} ${active ? "is-active" : ""}`}
                onClick={() => toggleSource(s)}
                aria-pressed={active}
              >
                {SOURCE_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-person">
          Person
        </label>
        <select
          id="filter-person"
          value={filters.person ?? ""}
          onChange={(e) =>
            onChange({ ...filters, person: e.target.value || null })
          }
        >
          <option value="">Any</option>
          {people.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-location">
          Location
        </label>
        <select
          id="filter-location"
          value={filters.location ?? ""}
          onChange={(e) =>
            onChange({ ...filters, location: e.target.value || null })
          }
        >
          <option value="">Any</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-reliability">
          Min tip reliability:{" "}
          <strong>
            {filters.minReliability === null
              ? "Any"
              : `${Math.round(filters.minReliability * 100)}%`}
          </strong>
        </label>
        <input
          id="filter-reliability"
          type="range"
          min={0}
          max={100}
          step={5}
          value={
            filters.minReliability === null
              ? 0
              : Math.round(filters.minReliability * 100)
          }
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange({
              ...filters,
              minReliability: v === 0 ? null : v / 100,
            });
          }}
        />
      </div>
    </section>
  );
}
