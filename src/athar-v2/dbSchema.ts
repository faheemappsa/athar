import type { AtharV2ContentType, AtharV2Occasion, AtharV2Source, AtharV2Tag } from "./types";

export type AtharV2DbItem = {
  id: string;
  type: AtharV2ContentType;
  text: string;
  normalizedText: string;
  source: AtharV2Source;
  sourceId: string;
  tags: AtharV2Tag[];
  occasions: AtharV2Occasion[];
  priority: number;
  weight: number;
  length: number;
  verified: boolean;
};

export type AtharV2StaticDb = {
  version: 2;
  generatedAt: string;
  buildMode: "offline_first_static_asset";
  maxItemLength: 150;
  displaySource: "local_static_db";
  liveExternalDisplay: false;
  items: AtharV2DbItem[];
};

export const ATHAR_V2_DB_LIMITS = {
  maxItemLength: 150,
  targetMaxBytes: 2 * 1024 * 1024,
  displayLatency: "zero_latency_local_read",
} as const;
