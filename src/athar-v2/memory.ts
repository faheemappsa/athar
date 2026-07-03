const RECENT_LIMIT = 8;

export function normalizeAtharV2RecentIds(ids: string[] = [], nextId?: string): string[] {
  const source = nextId ? [nextId, ...ids] : ids;
  const uniqueIds: string[] = [];

  for (const id of source) {
    if (typeof id !== "string") continue;
    if (!id.trim()) continue;
    if (uniqueIds.includes(id)) continue;
    uniqueIds.push(id);
    if (uniqueIds.length >= RECENT_LIMIT) break;
  }

  return uniqueIds;
}
