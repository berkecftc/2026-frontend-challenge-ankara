import type { NormalizedSubmission } from "../api/jotform";
import type { Record, SourceType } from "../types";
import { normalizeCheckin } from "./normalizeCheckins";
import { normalizeMessage } from "./normalizeMessages";
import { normalizeNote } from "./normalizeNotes";
import { normalizeSighting } from "./normalizeSightings";
import { normalizeTip } from "./normalizeTips";

const MAPPERS: { [K in SourceType]: (sub: NormalizedSubmission) => Record } = {
  checkin: normalizeCheckin,
  message: normalizeMessage,
  sighting: normalizeSighting,
  note: normalizeNote,
  tip: normalizeTip,
};

/** Apply the appropriate mapper for every submission of a given source. */
export function mapSubmissions(
  sourceType: SourceType,
  submissions: NormalizedSubmission[],
): Record[] {
  const mapper = MAPPERS[sourceType];
  return submissions.map(mapper);
}

export {
  normalizeCheckin,
  normalizeMessage,
  normalizeSighting,
  normalizeNote,
  normalizeTip,
};
