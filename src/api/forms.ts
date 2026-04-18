import type { FormConfig } from "./jotform";
import type { SourceType } from "../types";

export interface FormRegistryEntry {
  key: string;
  formId: string;
  sourceType: SourceType;
}


export const FORM_REGISTRY: FormRegistryEntry[] = [
  { key: "checkins", formId: "261065067494966", sourceType: "checkin" },
  { key: "messages", formId: "261065765723966", sourceType: "message" },
  { key: "sightings", formId: "261065244786967", sourceType: "sighting" },
  { key: "personalNotes", formId: "261065509008958", sourceType: "note" },
  { key: "anonymousTips", formId: "261065875889981", sourceType: "tip" },
];


function readApiKey(): string {
  const viteEnv =
    typeof import.meta !== "undefined"
      ? (import.meta as unknown as { env?: Record<string, string | undefined> })
        .env
      : undefined;
  const fromVite = viteEnv?.VITE_JOTFORM_API_KEY;

  const nodeProcess = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process;
  const fromNode = nodeProcess?.env?.JOTFORM_API_KEY;

  const key = fromVite ?? fromNode ?? "";
  if (!key) {
    console.warn(
      "[jotform] No API key found. Set VITE_JOTFORM_API_KEY in .env.local",
    );
  }
  return key;
}

export function getAllFormConfigs(): Array<FormConfig & { sourceType: SourceType }> {
  const apiKey = readApiKey();
  return FORM_REGISTRY.map((entry) => ({
    formId: entry.formId,
    apiKey,
    sourceType: entry.sourceType,
  }));
}
