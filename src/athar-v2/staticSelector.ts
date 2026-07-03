import { normalizeAtharV2RecentIds } from "./memory";
import { createAtharV2Moment } from "./moment";
import { getAtharV2StaticItems } from "./staticDb";
import type { AtharV2SelectionOptions, AtharV2SelectionResult } from "./types";

export function selectAtharV2FromStaticDb(options: AtharV2SelectionOptions = {}): AtharV2SelectionResult {
  const moment = createAtharV2Moment(options);
  const items = getAtharV2StaticItems();
  const recentIds = normalizeAtharV2RecentIds(options.recentIds ?? []);
  const mainPool = items.filter((item) => item.occasions.includes(moment.occasion));
  const closePool = items.filter((item) => item.occasions.some((occasion) => moment.secondaryOccasions.includes(occasion)));
  const pool = mainPool.length > 0 ? mainPool : closePool.length > 0 ? closePool : items;
  const available = pool.filter((item) => !recentIds.includes(item.id));
  const candidates = available.length > 0 ? available : pool;
  const item = [...candidates].sort((a, b) => b.priority + b.weight - (a.priority + a.weight))[0] ?? items[0];

  return {
    item,
    moment,
    poolSize: pool.length,
    reason: `static_db_${moment.occasion}_${pool.length}`,
  };
}
