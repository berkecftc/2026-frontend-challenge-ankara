interface ErrorDetail {
  label: string;
  message: string;
}

interface Props {
  title?: string;
  message: string;
  details?: ErrorDetail[];
  onRetry?: () => void;
}

export function ErrorState({ title, message, details, onRetry }: Props) {
  return (
    <div className="state state--error" role="alert">
      <h3>{title ?? "Evidence lost in transit"}</h3>
      <p>{message}</p>
      {details && details.length > 0 && (
        <ul className="state__details">
          {details.map((d, i) => (
            <li key={i}>
              <strong>{d.label}</strong>
              <span>{d.message}</span>
            </li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
