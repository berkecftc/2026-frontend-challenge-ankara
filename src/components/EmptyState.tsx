interface Props {
  title?: string;
  message?: string;
}

export function EmptyState({ title, message }: Props) {
  return (
    <div className="state state--empty">
      <h3>{title ?? "No evidence yet"}</h3>
      <p className="muted">
        {message ?? "There are no records to display. Try clearing filters."}
      </p>
    </div>
  );
}
