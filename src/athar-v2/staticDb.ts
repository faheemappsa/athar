import type { AtharV2Item } from "./types";

export type AtharV2StaticDb = {
  version: number;
  generatedAt: string;
  strategy: "offline-first-static-build-assets";
  maxTextLength: number;
  displaySource: "local-athar-v2-db";
  items: AtharV2Item[];
};

export function normalizeAtharV2StaticDb(input: unknown): AtharV2StaticDb | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Partial<AtharV2StaticDb>;
  if (!Array.isArray(candidate.items)) return null;

  return {
    version: Number(candidate.version ?? 1),
    generatedAt: String(candidate.generatedAt ?? ""),
    strategy: "offline-first-static-build-assets",
    maxTextLength: Number(candidate.maxTextLength ?? 150),
    displaySource: "local-athar-v2-db",
    items: candidate.items,
  };
}
