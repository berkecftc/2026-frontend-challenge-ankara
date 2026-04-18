import type { NormalizedSubmission } from "../api/jotform";
import type { Record } from "../types";
import { pickString, pickTimestamp } from "./fieldUtils";

export function normalizeSighting(sub: NormalizedSubmission): Record {
  const fields = sub.fields;
  return {
    id: `sighting:${sub.id}`,
    sourceType: "sighting",
    person: pickString(fields, [
      "seen",
      "subject",
      "target",
      "person",
      "gorulen",
      "kisi",
      "name",
    ]),
    relatedPerson: pickString(fields, [
      "with",
      "witness",
      "accompanied",
      "companion",
      "yanindaki",
      "beraberindeki",
    ]),
    location: pickString(fields, ["location", "place", "where", "yer", "lokasyon"]),
    timestamp: pickTimestamp(
      fields,
      ["time", "date", "when", "tarih", "zaman"],
      sub.createdAt,
    ),
    content: pickString(fields, [
      "note",
      "details",
      "description",
      "aciklama",
      "not",
    ]),
    reliability: null,
    raw: sub,
  };
}
