import type { NormalizedSubmission } from "../api/jotform";
import type { Record } from "../types";
import { pickString, pickTimestamp } from "./fieldUtils";

export function normalizeMessage(sub: NormalizedSubmission): Record {
  const fields = sub.fields;
  return {
    id: `message:${sub.id}`,
    sourceType: "message",
    person: pickString(fields, ["from", "sender", "gonderen"]),
    relatedPerson: pickString(fields, ["to", "recipient", "alici"]),
    location: pickString(fields, ["location", "place", "yer"]),
    timestamp: pickTimestamp(
      fields,
      ["time", "date", "when", "tarih", "zaman"],
      sub.createdAt,
    ),
    content: pickString(fields, ["message", "content", "text", "body", "mesaj"]),
    reliability: null,
    raw: sub,
  };
}
