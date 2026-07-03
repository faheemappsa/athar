import { ATHAR_V2_CATALOG } from "./catalog";
import type { AtharV2StaticDb } from "./dbSchema";

export function normalizeAtharV2StaticDb(input: unknown): AtharV2StaticDb | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Partial<AtharV2StaticDb>;
  if (!Array.isArray(candidate.items)) return null;

  return {
    version: 2,
    generatedAt: String(candidate.generatedAt ?? ""),
    buildMode: "offline_first_static_asset",
    maxItemLength: 150,
    displaySource: "local_static_db",
    liveExternalDisplay: false,
    items: candidate.items.filter((item) => item.verified !== false && item.text.length <= 150),
  };
}

export function createAtharV2StaticDbSnapshot(): AtharV2StaticDb {
  return {
    version: 2,
    generatedAt: "development-catalog",
    buildMode: "offline_first_static_asset",
    maxItemLength: 150,
    displaySource: "local_static_db",
    liveExternalDisplay: false,
    items: ATHAR_V2_CATALOG.map((item) => ({
      ...item,
      normalizedText: item.text.normalize("NFKC"),
      sourceId: item.source.title,
      length: item.text.length,
      verified: Boolean(item.source.title && item.source.reference && item.text.length <= 150),
    })),
  };
}

export function getAtharV2StaticItems() {
  return createAtharV2StaticDbSnapshot().items.filter((item) => item.verified);
}
