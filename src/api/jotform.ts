/**
 * Jotform API data-fetching layer.
 *
 * Responsibilities:
 *  - Talk to the Jotform REST API over native fetch.
 *  - Normalize raw submissions into a UI-friendly shape.
 *  - Aggregate results across multiple forms without failing the whole batch
 *    when a single form errors out.
 *
 * This module is intentionally UI-agnostic: it returns plain data and throws
 * typed errors. Components/hooks should wrap it, not the other way around.
 */

const JOTFORM_BASE_URL = "https://api.jotform.com";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormConfig {
  formId: string;
  apiKey: string;
}

export interface FetchOptions {
  /** Max submissions to return (Jotform default: 20, max: 1000). */
  limit?: number;
  /** Starting offset for pagination. */
  offset?: number;
  /** AbortSignal to cancel in-flight requests. */
  signal?: AbortSignal;
}

/** Shape of a raw Jotform API envelope. */
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

/** A raw submission as returned by Jotform. */
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

/** Normalized submission consumed by the UI. */
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

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Core fetch
// ---------------------------------------------------------------------------

/**
 * Fetch submissions for a single form.
 *
 * Throws JotformError on HTTP failures or non-200 Jotform response codes.
 */
export async function fetchFormSubmissions(
  formId: string,
  apiKey: string,
  options: FetchOptions = {},
): Promise<NormalizedSubmission[]> {
  if (!formId) throw new JotformError("formId is required");
  if (!apiKey) throw new JotformError("apiKey is required", undefined, formId);

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
  return submissions.map(normalizeSubmission);
}

// ---------------------------------------------------------------------------
// Multi-form aggregation
// ---------------------------------------------------------------------------

/**
 * Fetch submissions from many forms in parallel.
 *
 * Uses Promise.allSettled so one failing form does not abort the batch.
 * Returns a per-form result object — callers decide how to render successes
 * vs failures.
 */
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

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/**
 * Convert a raw Jotform submission into a flat, UI-friendly object.
 *
 * Each answer is keyed by its field name (falling back to the question label,
 * then the numeric qid) so UI code can reference fields semantically rather
 * than by Jotform's internal ids.
 */
export function normalizeSubmission(raw: RawSubmission): NormalizedSubmission {
  const fields: Record<string, unknown> = {};

  for (const [qid, answer] of Object.entries(raw.answers ?? {})) {
    const key = answer?.name || answer?.text || qid;
    // Prefer the human-readable prettyFormat when Jotform provides it
    // (dates, times, addresses, etc.), otherwise fall back to the raw answer.
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
