const RECENT_KEY = "athar-recent-ids";
const MAX_RECENT = 20;

const normalizeRecentIds = (ids: string[]) => {
  return Array.from(new Set(ids.filter(Boolean))).slice(0, MAX_RECENT);
};

export const readAtharRecentIds = () => {
  try {
    return normalizeRecentIds(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as string[]);
  } catch {
    return [];
  }
};

export const rememberAtharContentId = (id: string) => {
  try {
    const next = normalizeRecentIds([id, ...readAtharRecentIds().filter((item) => item !== id)]);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
};

export const mergeAtharAvoidIds = (ids: string[] = []) => normalizeRecentIds([...ids, ...readAtharRecentIds()]);
