/**
 * Skeleton loading card — RecordCard şeklinde bir placeholder gösterir.
 * İçerik yüklenirken kullanılır.
 */
export function RecordCardSkeleton() {
  return (
    <li className="record-card skeleton-card" aria-hidden="true">
      <div className="record-card__top">
        <span className="skeleton-bar" style={{ width: 56, height: 16 }} />
        <span className="skeleton-bar" style={{ width: 40, height: 12 }} />
      </div>
      <div className="skeleton-bar" style={{ width: "80%", height: 14 }} />
      <div className="skeleton-bar" style={{ width: "55%", height: 12 }} />
      <div className="skeleton-bar" style={{ width: "100%", height: 4, marginTop: 4 }} />
    </li>
  );
}

/** Birden fazla skeleton kart gösteren wrapper. */
export function RecordListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="record-list" aria-busy="true" aria-label="Loading records">
      {Array.from({ length: count }, (_, i) => (
        <RecordCardSkeleton key={i} />
      ))}
    </ul>
  );
}
