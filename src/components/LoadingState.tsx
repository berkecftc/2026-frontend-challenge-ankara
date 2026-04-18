export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{message ?? "Collecting evidence from all sources..."}</p>
    </div>
  );
}
