import type { ExperienceContent } from "./model";

const CONTENT_CACHE_KEY = "athar-content-cache-v1";

type CachedContent = {
  item: ExperienceContent;
  savedAt: number;
};

const readCacheMap = (): Record<string, CachedContent> => {
  try {
    const raw = window.localStorage.getItem(CONTENT_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeCacheMap = (cache: Record<string, CachedContent>) => {
  try {
    window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

export const saveContentToCache = (item: ExperienceContent) => {
  const cache = readCacheMap();
  cache[item.id] = { item, savedAt: Date.now() };
  writeCacheMap(cache);
};

export const readContentCache = () => {
  return Object.values(readCacheMap()).map((entry) => entry.item);
};
