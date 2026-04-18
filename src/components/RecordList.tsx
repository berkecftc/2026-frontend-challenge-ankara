import { useEffect, useRef } from "react";
import type { Record } from "../types";
import { RecordCard } from "./RecordCard";

interface Props {
  records: Record[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RecordList({ records, selectedId, onSelect }: Props) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-record-id="${selectedId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  if (records.length === 0) {
    return (
      <p className="record-list__empty">
        No records match your search. Try adjusting filters.
      </p>
    );
  }

  return (
    <ul
      ref={listRef}
      className="record-list"
      role="listbox"
      aria-label="Investigation records"
    >
      {records.map((r) => (
        <RecordCard
          key={r.id}
          record={r}
          isSelected={r.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
