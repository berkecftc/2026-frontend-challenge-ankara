import { useMemo, useState } from "react";
import { DetailPanel } from "../components/DetailPanel";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { FilterPanel } from "../components/FilterPanel";
import { LoadingState } from "../components/LoadingState";
import { MapView } from "../components/MapView";
import { RecordList } from "../components/RecordList";
import { SearchBar } from "../components/SearchBar";
import { RecordListSkeleton } from "../components/Skeleton";
import { SummaryPanel } from "../components/SummaryPanel";
import { Timeline } from "../components/Timeline";
import { useInvestigationData } from "../hooks/useInvestigationData";
import type { Filters } from "../types";
import { EMPTY_FILTERS, filterRecords } from "../utils/filters";
import { uniqueFuzzy } from "../utils/grouping";
import { getRelatedRecords } from "../utils/linking";
import { computeSuspicionSummary } from "../utils/scoring";

type CenterTab = "detail" | "timeline";
type LeftView = "list" | "map";

export function DashboardPage() {
  const { status, records, sourceErrors, fatalError, fromCache, reload, forceReload } =
    useInvestigationData();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [centerTab, setCenterTab] = useState<CenterTab>("detail");
  const [leftView, setLeftView] = useState<LeftView>("list");

  const people = useMemo(
    () =>
      uniqueFuzzy(
        records.flatMap((r) => [r.person, r.relatedPerson]),
        0.4 // Inclusive for names with initials
      ),
    [records],
  );
  const locations = useMemo(
    () => uniqueFuzzy(records.map((r) => r.location)),
    [records],
  );

  const visible = useMemo(
    () => filterRecords(records, query, filters),
    [records, query, filters],
  );

  const selected = useMemo(
    () => records.find((r) => r.id === selectedId) ?? null,
    [records, selectedId],
  );

  const related = useMemo(
    () => (selected ? getRelatedRecords(selected, records) : []),
    [selected, records],
  );

  const summary = useMemo(() => computeSuspicionSummary(records), [records]);

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setQuery("");
  };

  const handleTimelineSelect = (id: string) => {
    setSelectedId(id);
    setCenterTab("detail");
  };

  if (status === "loading" && records.length === 0) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1>Missing Podo — Investigation Dashboard</h1>
            <p className="muted">Loading investigation data…</p>
          </div>
        </header>
        <main className="app-grid">
          <section className="panel panel--left">
            <div className="search-bar">
              <input disabled placeholder="Search records…" />
            </div>
            <div className="panel__scroll">
              <RecordListSkeleton count={8} />
            </div>
          </section>
          <section className="panel panel--center">
            <div className="detail detail--empty">
              <LoadingState />
            </div>
          </section>
          <section className="panel panel--right">
            <div className="summary">
              <div className="skeleton-bar" style={{ width: "60%", height: 20 }} />
              <div className="skeleton-bar" style={{ width: "80%", height: 14 }} />
              <div className="skeleton-bar" style={{ width: "100%", height: 60 }} />
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (status === "error" && records.length === 0) {
    return (
      <div className="app-shell app-shell--center">
        <ErrorState
          message={fatalError ?? "Unable to reach Jotform."}
          details={sourceErrors.map((e) => ({
            label: e.sourceType,
            message: e.message,
          }))}
          onRetry={reload}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
        <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo">🐾</div>
          <div>
            <h1>Missing Podo <span className="muted" style={{ fontWeight: 400 }}>Dashboard</span></h1>
            <p className="muted" style={{ fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {records.length} Intelligence Units · {sourceErrors.length} Offline
              {fromCache && " · Cached"}
            </p>
          </div>
        </div>
        <div className="app-header__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={forceReload}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Syncing..." : "🔄 Refresh"}
          </button>
        </div>
      </header>

      {sourceErrors.length > 0 && (
        <div className="warning-bar" role="status">
          Partial data: {sourceErrors.map((e) => e.sourceType).join(", ")}{" "}
          failed to load. Other sources shown below.
        </div>
      )}

      <main className="app-grid">
        <section className="panel panel--left">
          <SearchBar value={query} onChange={setQuery} />
          <FilterPanel
            filters={filters}
            people={people}
            locations={locations}
            onChange={setFilters}
            onReset={resetFilters}
          />

          <div className="view-toggle">
            <button
              type="button"
              className={`view-toggle__btn ${leftView === "list" ? "is-active" : ""}`}
              onClick={() => setLeftView("list")}
            >
              📋 List
            </button>
            <button
              type="button"
              className={`view-toggle__btn ${leftView === "map" ? "is-active" : ""}`}
              onClick={() => setLeftView("map")}
            >
              🗺️ Map
            </button>
          </div>

          {leftView === "list" ? (
            <div className="panel__scroll">
              {records.length === 0 ? (
                <EmptyState message="No records returned from any source yet." />
              ) : (
                <RecordList
                  records={visible}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
            </div>
          ) : (
            <div className="panel__scroll">
              <MapView
                records={visible}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          )}
        </section>

        <section className="panel panel--center">
          <div className="tab-bar">
            <button
              type="button"
              className={`tab-bar__tab ${centerTab === "detail" ? "is-active" : ""}`}
              onClick={() => setCenterTab("detail")}
            >
              🔍 Detail
            </button>
            <button
              type="button"
              className={`tab-bar__tab ${centerTab === "timeline" ? "is-active" : ""}`}
              onClick={() => setCenterTab("timeline")}
            >
              ⏱️ Timeline
            </button>
          </div>

          {centerTab === "detail" ? (
            <DetailPanel
              record={selected}
              related={related}
              onSelect={setSelectedId}
            />
          ) : (
            <Timeline
              records={records}
              selectedId={selectedId}
              onSelect={handleTimelineSelect}
            />
          )}
        </section>

        <section className="panel panel--right">
          <SummaryPanel
            summary={summary}
            onFilterPerson={(name) =>
              setFilters((f) => ({ ...f, person: name }))
            }
            onFilterLocation={(name) =>
              setFilters((f) => ({ ...f, location: name }))
            }
            onSelectRecord={setSelectedId}
          />
        </section>
      </main>
    </div>
  );
}
