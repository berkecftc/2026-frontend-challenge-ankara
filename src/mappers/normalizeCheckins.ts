import type { NormalizedSubmission } from "../api/jotform";
import type { Record } from "../types";
import { pickString, pickTimestamp } from "./fieldUtils";

export function normalizeCheckin(sub: NormalizedSubmission): Record {
  const fields = sub.fields;
  return {
    id: `checkin:${sub.id}`,
    sourceType: "checkin",
    person: pickString(fields, ["name", "person", "who", "kisi", "isim"]),
    relatedPerson: pickString(fields, ["with", "companion", "yanindaki"]),
    location: pickString(fields, ["location", "place", "where", "yer", "lokasyon"]),
    timestamp: pickTimestamp(
      fields,
      ["time", "date", "when", "tarih", "zaman"],
      sub.createdAt,
    ),
    content: pickString(fields, ["note", "details", "description", "aciklama"]),
    reliability: null,
    raw: sub,
  };
}
