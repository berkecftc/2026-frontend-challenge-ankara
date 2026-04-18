const JOTFORM_BASE_URL = "https://api.jotform.com";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormConfig {
  formId: string;
  apiKey: string;
}

export interface FetchOptions {
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
  cache?: boolean;
  cacheTtlMs?: number;
  force?: boolean;
}

interface JotformEnvelope<T> {
  responseCode: number;
  message: string;
  content: T;
  "limit-left"?: number;
  resultSet?: {
    offset: number;
    limit: number;
    count: number;
  };
}

interface RawSubmission {
  id: string;
  form_id: string;
  created_at: string;
  updated_at: string | null;
  status: string;
  answers: Record<
    string,
    {
      name?: string;
      text?: string;
      type?: string;
      answer?: unknown;
      prettyFormat?: string;
    }
  >;
}

export interface NormalizedSubmission {
  id: string;
  formId: string;
  createdAt: string;
  updatedAt: string | null;
  status: string;
  fields: Record<string, unknown>;
}

export type FormResult =
  | {
    formId: string;
    status: "success";
    data: NormalizedSubmission[];
    error: null;
  }
  | {
    formId: string;
    status: "failure";
    data: null;
    error: string;
  };

export class JotformError extends Error {
  constructor(
    message: string,
    public readonly responseCode?: number,
    public readonly formId?: string,
  ) {
    super(message);
    this.name = "JotformError";
  }
}

export async function fetchFormSubmissions(
  formId: string,
  apiKey: string,
  options: FetchOptions = {},
): Promise<NormalizedSubmission[]> {
  if (!formId) throw new JotformError("formId is required");
  if (!apiKey) throw new JotformError("apiKey is required", undefined, formId);

  const ttl = options.cacheTtlMs ?? 10 * 60 * 1000;
  const ckey = options.cache ? cacheKey(formId, options) : null;

  if (ckey && !options.force) {
    const cached = readCache(ckey);
    if (cached) return cached;
  }

  const url = buildSubmissionsUrl(formId, apiKey, options);

  let response: Response;
  try {
    response = await fetch(url, { signal: options.signal });
  } catch (err) {
    // Network-level failure (DNS, offline, CORS, abort, etc.)
    const reason = err instanceof Error ? err.message : String(err);
    throw new JotformError(
      `Network error while fetching form ${formId}: ${reason}`,
      undefined,
      formId,
    );
  }

  if (!response.ok) {
    throw new JotformError(
      `HTTP ${response.status} ${response.statusText} for form ${formId}`,
      response.status,
      formId,
    );
  }

  let payload: JotformEnvelope<RawSubmission[]>;
  try {
    payload = (await response.json()) as JotformEnvelope<RawSubmission[]>;
  } catch {
    throw new JotformError(
      `Invalid JSON response for form ${formId}`,
      undefined,
      formId,
    );
  }

  if (payload.responseCode !== 200) {
    throw new JotformError(
      `Jotform API error for form ${formId}: ${payload.message || "unknown"}`,
      payload.responseCode,
      formId,
    );
  }

  const submissions = Array.isArray(payload.content) ? payload.content : [];
  const normalized = submissions.map(normalizeSubmission);

  if (ckey) writeCache(ckey, normalized, ttl);

  return normalized;
}


export async function fetchMultipleForms(
  forms: FormConfig[],
  options: FetchOptions = {},
): Promise<FormResult[]> {
  const settled = await Promise.allSettled(
    forms.map((form) =>
      fetchFormSubmissions(form.formId, form.apiKey, options),
    ),
  );

  return settled.map((result, i) => {
    const formId = forms[i].formId;
    if (result.status === "fulfilled") {
      return { formId, status: "success", data: result.value, error: null };
    }
    const reason = result.reason;
    const message =
      reason instanceof Error ? reason.message : String(reason ?? "Unknown error");
    return { formId, status: "failure", data: null, error: message };
  });
}

export function normalizeSubmission(raw: RawSubmission): NormalizedSubmission {
  const fields: Record<string, unknown> = {};

  for (const [qid, answer] of Object.entries(raw.answers ?? {})) {
    const key = answer?.name || answer?.text || qid;
    const value =
      answer?.prettyFormat !== undefined && answer?.prettyFormat !== ""
        ? answer.prettyFormat
        : answer?.answer;
    fields[key] = value;
  }

  return {
    id: raw.id,
    formId: raw.form_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at ?? null,
    status: raw.status,
    fields,
  };
}

function buildSubmissionsUrl(
  formId: string,
  apiKey: string,
  { limit, offset }: FetchOptions,
): string {
  const url = new URL(
    `/form/${encodeURIComponent(formId)}/submissions`,
    JOTFORM_BASE_URL,
  );
  url.searchParams.set("apiKey", apiKey);
  if (limit !== undefined) url.searchParams.set("limit", String(limit));
  if (offset !== undefined) url.searchParams.set("offset", String(offset));
  return url.toString();
}



const CACHE_PREFIX = "jotform:cache:";

interface CacheEntry {
  expiresAt: number;
  data: NormalizedSubmission[];
}

function cacheKey(formId: string, options: FetchOptions): string {
  return `${CACHE_PREFIX}${formId}:${options.limit ?? ""}:${options.offset ?? ""}`;
}

function readCache(key: string): NormalizedSubmission[] | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (!entry?.expiresAt || entry.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(
  key: string,
  data: NormalizedSubmission[],
  ttlMs: number,
): void {
  if (typeof localStorage === "undefined") return;
  try {
    const entry: CacheEntry = { expiresAt: Date.now() + ttlMs, data };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
  }
}

export function clearJotformCache(): void {
  if (typeof localStorage === "undefined") return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) toRemove.push(key);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}
