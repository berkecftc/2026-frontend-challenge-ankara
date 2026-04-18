import type { NormalizedSubmission } from "../api/jotform";
import type { Record } from "../types";
import { pickString, pickTimestamp } from "./fieldUtils";

export function normalizeNote(sub: NormalizedSubmission): Record {
  const fields = sub.fields;
  return {
    id: `note:${sub.id}`,
    sourceType: "note",
    person: pickString(fields, ["author", "from", "name", "yazar", "kisi"]),
    relatedPerson: pickString(fields, ["about", "subject", "regarding", "hakkinda"]),
    location: pickString(fields, ["location", "place", "yer"]),
    timestamp: pickTimestamp(
      fields,
      ["time", "date", "when", "tarih", "zaman"],
      sub.createdAt,
    ),
    content: pickString(fields, ["note", "content", "text", "body", "not", "aciklama"]),
    reliability: null,
    raw: sub,
  };
}
