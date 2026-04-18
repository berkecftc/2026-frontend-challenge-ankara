import { useCallback, useEffect, useRef, useState } from "react";
import { fetchFormSubmissions, clearJotformCache } from "../api/jotform";
import { getAllFormConfigs } from "../api/forms";
import { mapSubmissions } from "../mappers";
import type { FetchStatus, Record, SourceType } from "../types";
import { compareTimestampsDesc } from "../utils/date";
import { DEFAULT_CACHE_TTL_MS, DEFAULT_FETCH_LIMIT } from "../constants";

export interface SourceError {
  sourceType: SourceType;
  formId: string;
  message: string;
}

export interface InvestigationDataState {
  status: FetchStatus;
  records: Record[];
  sourceErrors: SourceError[];
  fatalError: string | null;
  fromCache: boolean;
  reload: () => void;
  forceReload: () => void;
}

interface SourceLoadResult {
  records: Record[];
  error: SourceError | null;
  fromCache: boolean;
}

async function loadAllSources(
  force: boolean,
  signal: AbortSignal,
): Promise<{ records: Record[]; sourceErrors: SourceError[]; fromCache: boolean }> {
  const configs = getAllFormConfigs();

  const settled = await Promise.allSettled(
    configs.map((cfg) =>
      fetchFormSubmissions(cfg.formId, cfg.apiKey, {
        signal,
        limit: DEFAULT_FETCH_LIMIT,
        cache: true,
        cacheTtlMs: DEFAULT_CACHE_TTL_MS,
        force,
      }),
    ),
  );

  const results: SourceLoadResult[] = settled.map((result, i) => {
    const cfg = configs[i];
    if (result.status === "fulfilled") {
      return {
        records: mapSubmissions(cfg.sourceType, result.value),
        error: null,
        fromCache: !force,
      };
    }
    const errorMessage =
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason ?? "Unknown error");

    console.error(
      `[jotform] ${cfg.sourceType} (${cfg.formId}) failed:`,
      result.reason,
    );

    return {
      records: [],
      error: { sourceType: cfg.sourceType, formId: cfg.formId, message: errorMessage },
      fromCache: false,
    };
  });

  const allRecords = results.flatMap((r) => r.records);
  const sourceErrors = results
    .map((r) => r.error)
    .filter((e): e is SourceError => e !== null);

  allRecords.sort((a, b) => compareTimestampsDesc(a.timestamp, b.timestamp));

  const fromCache = !force && sourceErrors.length === 0 && allRecords.length > 0;

  return { records: allRecords, sourceErrors, fromCache };
}

function isAllSourcesFailed(sourceErrors: SourceError[], totalSources: number): boolean {
  return sourceErrors.length === totalSources && totalSources > 0;
}

export function useInvestigationData(): InvestigationDataState {
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [records, setRecords] = useState<Record[]>([]);
  const [sourceErrors, setSourceErrors] = useState<SourceError[]>([]);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (force: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setFatalError(null);
    setSourceErrors([]);
    setFromCache(false);

    if (force) clearJotformCache();

    try {
      const { records, sourceErrors, fromCache } = await loadAllSources(
        force,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      const configs = getAllFormConfigs();
      const allFailed = isAllSourcesFailed(sourceErrors, configs.length);

      setRecords(records);
      setSourceErrors(sourceErrors);
      setFromCache(fromCache);
      setStatus(allFailed ? "error" : "success");
      if (allFailed) setFatalError("All data sources failed to load.");
    } catch (err) {
      if (controller.signal.aborted) return;
      setStatus("error");
      setFatalError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const reload = useCallback(() => load(false), [load]);
  const forceReload = useCallback(() => load(true), [load]);

  useEffect(() => {
    load(false);
    return () => abortRef.current?.abort();
  }, [load]);

  return { status, records, sourceErrors, fatalError, fromCache, reload, forceReload };
}
