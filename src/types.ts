export type SourceType =
  | "checkin"
  | "message"
  | "sighting"
  | "note"
  | "tip";

export interface Record {
  id: string;
  sourceType: SourceType;
  person: string | null;
  relatedPerson: string | null;
  location: string | null;
  timestamp: string | null;
  content: string | null;
  reliability: number | null;
  raw: unknown;
}

export interface Filters {
  sourceTypes: Set<SourceType>;
  person: string | null;
  location: string | null;
  minReliability: number | null;
}

export type FetchStatus = "idle" | "loading" | "success" | "error";
