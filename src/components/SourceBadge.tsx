import type { SourceType } from "../types";

const LABELS: { [K in SourceType]: string } = {
  checkin: "Check-in",
  message: "Message",
  sighting: "Sighting",
  note: "Note",
  tip: "Tip",
};

interface Props {
  sourceType: SourceType;
}

export function SourceBadge({ sourceType }: Props) {
  return (
    <span className={`badge badge--${sourceType}`}>{LABELS[sourceType]}</span>
  );
}
