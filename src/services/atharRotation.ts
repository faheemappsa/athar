const RECENT_KEY = "athar-recent-ids";
const MAX_RECENT = 24;

export const readAtharRecentIds = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as string[];
  } catch {
    return [];
  }
};

export const rememberAtharContentId = (id: string) => {
  try {
    const next = [id, ...readAtharRecentIds().filter((item) => item !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
};
