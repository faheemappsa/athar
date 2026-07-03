import { ATHAR_V2_CATALOG } from "./catalog";
import { normalizeAtharV2RecentIds } from "./memory";
import { createAtharV2Moment } from "./moment";
import type { AtharV2SelectionOptions, AtharV2SelectionResult } from "./types";

export function selectAtharV2(options: AtharV2SelectionOptions = {}): AtharV2SelectionResult {
  const moment = createAtharV2Moment(options);
  const recentIds = normalizeAtharV2RecentIds(options.recentIds ?? []);
  const mainPool = ATHAR_V2_CATALOG.filter((item) => item.occasions.includes(moment.occasion));
  const closePool = ATHAR_V2_CATALOG.filter((item) => item.occasions.some((occasion) => moment.secondaryOccasions.includes(occasion)));
  const pool = mainPool.length > 0 ? mainPool : closePool.length > 0 ? closePool : ATHAR_V2_CATALOG;
  const available = pool.filter((item) => !recentIds.includes(item.id));
  const candidates = available.length > 0 ? available : pool;
  const item = [...candidates].sort((a, b) => b.priority + b.weight - (a.priority + a.weight))[0] ?? ATHAR_V2_CATALOG[0];

  return {
    item,
    moment,
    poolSize: pool.length,
    reason: `selected_by_${moment.occasion}_from_${pool.length}_items`,
  };
}

export function getAtharV2LibrarySnapshot() {
  const byType: Record<string, number> = {};
  for (const item of ATHAR_V2_CATALOG) {
    byType[item.type] = (byType[item.type] ?? 0) + 1;
  }
  return { total: ATHAR_V2_CATALOG.length, byType };
}
