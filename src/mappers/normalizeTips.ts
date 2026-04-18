import type { NormalizedSubmission } from "../api/jotform";
import type { Record } from "../types";
import { pickReliability, pickString, pickTimestamp } from "./fieldUtils";

export function normalizeTip(sub: NormalizedSubmission): Record {
  const fields = sub.fields;
  return {
    id: `tip:${sub.id}`,
    sourceType: "tip",
    // Anonymous tips usually don't identify the reporter — the useful
    // "person" is whoever the tip is about.
    person: pickString(fields, [
      "about",
      "subject",
      "suspect",
      "regarding",
      "person",
      "hakkinda",
      "suphe",
    ]),
    relatedPerson: pickString(fields, ["with", "companion", "other", "beraberindeki"]),
    location: pickString(fields, ["location", "place", "where", "yer", "lokasyon"]),
    timestamp: pickTimestamp(
      fields,
      ["time", "date", "when", "tarih", "zaman"],
      sub.createdAt,
    ),
    content: pickString(fields, [
      "tip",
      "details",
      "content",
      "description",
      "text",
      "ihbar",
      "aciklama",
    ]),
    reliability: pickReliability(fields, [
      "reliability",
      "confidence",
      "score",
      "trust",
      "guvenilirlik",
    ]),
    raw: sub,
  };
}
