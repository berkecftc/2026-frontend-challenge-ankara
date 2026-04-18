/**
 * Jotform REST API istemcisi.
 *
 * Bu dosya yalnızca ağ iletişiminden sorumludur.
 * Önbellek mantığı `./cache.ts` modülündedir.
 * Form kayıt defteri `./forms.ts` dosyasındadır.
 */

import { JOTFORM_BASE_URL, DEFAULT_CACHE_TTL_MS } from "../constants";
import { buildCacheKey, readCache, writeCache, clearCache } from "./cache";

// ---------------------------------------------------------------------------
// Tip tanımları (Public)
// ---------------------------------------------------------------------------

export interface FormConfig {
  formId: string;
  apiKey: string;
}

export interface FetchOptions {
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
  /** True ise localStorage önbelleğini kullan. */
  cache?: boolean;
  /** Önbellek ömrü (ms). Varsayılan: `DEFAULT_CACHE_TTL_MS` */
  cacheTtlMs?: number;
  /** True ise önbelleği atlayarak her zaman ağdan çek. */
  force?: boolean;
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
  | { formId: string; status: "success"; data: NormalizedSubmission[]; error: null }
  | { formId: string; status: "failure"; data: null; error: string };

// ---------------------------------------------------------------------------
// Tip tanımları (Internal — Jotform API şeması)
// ---------------------------------------------------------------------------

interface JotformEnvelope<T> {
  responseCode: number;
  message: string;
  content: T;
  "limit-left"?: number;
  resultSet?: { offset: number; limit: number; count: number };
}

interface RawAnswer {
  name?: string;
  text?: string;
  type?: string;
  answer?: unknown;
  prettyFormat?: string;
}

interface RawSubmission {
  id: string;
  form_id: string;
  created_at: string;
  updated_at: string | null;
  status: string;
  answers: Record<string, RawAnswer>;
}

// ---------------------------------------------------------------------------
// Hata sınıfı
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
// Public API — fetchFormSubmissions
// ---------------------------------------------------------------------------

/**
 * Belirtilen form için Jotform gönderilerini çeker ve normalleştirir.
 *
 * - `options.cache = true` ise önce localStorage kontrol edilir.
 * - `options.force = true` ise önbellek atlanır (API kotası harcanır).
 * - Ağ, HTTP ve Jotform API hataları `JotformError` olarak fırlatılır.
 */
export async function fetchFormSubmissions(
  formId: string,
  apiKey: string,
  options: FetchOptions = {},
): Promise<NormalizedSubmission[]> {
  if (!formId) throw new JotformError("formId is required");
  if (!apiKey) throw new JotformError("apiKey is required", undefined, formId);

  const ttl = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
  const cacheKey = options.cache
    ? buildCacheKey(formId, options.limit, options.offset)
    : null;

  // Önbellekte taze veri varsa ağa gitmeden döner.
  if (cacheKey && !options.force) {
    const cached = readCache(cacheKey);
    if (cached) return cached;
  }

  const raw = await doFetch(formId, apiKey, options);
  const normalized = raw.map(normalizeSubmission);

  if (cacheKey) writeCache(cacheKey, normalized, ttl);

  return normalized;
}

// ---------------------------------------------------------------------------
// Public API — fetchMultipleForms
// ---------------------------------------------------------------------------

/**
 * Birden fazla form için paralel istek atar.
 * Herhangi bir form başarısız olsa bile diğerleri döner
 * (`Promise.allSettled` semantiği).
 */
export async function fetchMultipleForms(
  forms: FormConfig[],
  options: FetchOptions = {},
): Promise<FormResult[]> {
  const settled = await Promise.allSettled(
    forms.map((form) => fetchFormSubmissions(form.formId, form.apiKey, options)),
  );

  return settled.map((result, i) => {
    const formId = forms[i].formId;
    if (result.status === "fulfilled") {
      return { formId, status: "success", data: result.value, error: null };
    }
    const message =
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason ?? "Unknown error");
    return { formId, status: "failure", data: null, error: message };
  });
}

// ---------------------------------------------------------------------------
// Public re-export — cache temizleme
// ---------------------------------------------------------------------------

/**
 * Jotform'a ait tüm önbellek girdilerini temizler.
 * Doğrudan `clearCache` içe aktarmak yerine bu sarmalayıcıyı kullanın;
 * böylece önbellek modülü değişseydi yalnızca bu dosyayı güncellemeniz yeterlidir.
 */
export function clearJotformCache(): void {
  clearCache();
}

// ---------------------------------------------------------------------------
// Normalleştirme — dahili yardımcılar
// ---------------------------------------------------------------------------

/** Tek bir ham Jotform gönderisini kanonik yapıya çevirir. */
export function normalizeSubmission(raw: RawSubmission): NormalizedSubmission {
  const fields: Record<string, unknown> = {};

  for (const [qid, answer] of Object.entries(raw.answers ?? {})) {
    const key = answer?.name || answer?.text || qid;
    const value = resolveAnswerValue(answer);
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

/**
 * Jotform cevap nesnesinin ham değerini çözer.
 * `prettyFormat` varsa tercih edilir (kullanıcı dostu metin).
 */
function resolveAnswerValue(answer: RawAnswer): unknown {
  const pretty = answer?.prettyFormat;
  if (pretty !== undefined && pretty !== "") return pretty;
  return answer?.answer;
}

// ---------------------------------------------------------------------------
// Ağ katmanı — dahili yardımcılar
// ---------------------------------------------------------------------------

/**
 * Ham Jotform API isteğini atar ve `RawSubmission[]` döndürür.
 * Ağ, HTTP ve Jotform uygulama hataları burada yakalanır ve
 * `JotformError` olarak yeniden fırlatılır.
 */
async function doFetch(
  formId: string,
  apiKey: string,
  options: FetchOptions,
): Promise<RawSubmission[]> {
  const url = buildSubmissionsUrl(formId, apiKey, options);

  const response = await fetchWithNetworkGuard(url, formId, options.signal);
  const payload = await parseJsonPayload(response, formId);
  assertApiSuccess(payload, formId);

  return Array.isArray(payload.content) ? payload.content : [];
}

/** Ağ isteğini atar; ağ seviyesi hatalar `JotformError`'a dönüştürülür. */
async function fetchWithNetworkGuard(
  url: string,
  formId: string,
  signal?: AbortSignal,
): Promise<Response> {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new JotformError(
        `HTTP ${response.status} ${response.statusText} — form: ${formId}`,
        response.status,
        formId,
      );
    }
    return response;
  } catch (err) {
    // JotformError zaten fırlatılmışsa tekrar sarmaya gerek yok.
    if (err instanceof JotformError) throw err;
    const reason = err instanceof Error ? err.message : String(err);
    throw new JotformError(
      `Ağ hatası — form: ${formId}: ${reason}`,
      undefined,
      formId,
    );
  }
}

/** Response body'sini JSON olarak ayrıştırır. */
async function parseJsonPayload(
  response: Response,
  formId: string,
): Promise<JotformEnvelope<RawSubmission[]>> {
  try {
    return (await response.json()) as JotformEnvelope<RawSubmission[]>;
  } catch {
    throw new JotformError(
      `Geçersiz JSON yanıtı — form: ${formId}`,
      undefined,
      formId,
    );
  }
}

/** Jotform uygulama katmanı başarı kodunu doğrular. */
function assertApiSuccess(
  payload: JotformEnvelope<unknown>,
  formId: string,
): void {
  if (payload.responseCode !== 200) {
    throw new JotformError(
      `Jotform API hatası — form: ${formId}: ${payload.message || "bilinmiyor"}`,
      payload.responseCode,
      formId,
    );
  }
}

/** Sorgu parametrelerini içeren tam API URL'ini oluşturur. */
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
