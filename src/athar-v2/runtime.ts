import { getAtharV2CardContent } from "./cardService";
import type { AtharV2RecentStore } from "./recentStore";

export function runAtharV2Card(store: AtharV2RecentStore) {
  const result = getAtharV2CardContent(store.read());
  store.write(result.nextRecentIds);
  return result;
}
