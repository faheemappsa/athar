import type { AtharProviderContent } from "./types";

const CACHE_KEY = "athar-content-cache-v1";
const MAX_CACHE_ITEMS = 80;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14;

type CacheEntry = {
  content: AtharProviderContent;
  storedAt: number;
};

const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readEntries = (): CacheEntry[] => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(CACHE_KEY);
    const entries = raw ? (JSON.parse(raw) as CacheEntry[]) : [];
    const now = Date.now();
    return entries.filter((entry) => now - entry.storedAt <= CACHE_TTL_MS).slice(0, MAX_CACHE_ITEMS);
  } catch {
    return [];
  }
};

const writeEntries = (entries: CacheEntry[]) => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(CACHE_KEY, JSON.stringify(entries.slice(0, MAX_CACHE_ITEMS)));
  } catch {}
};

export const cacheAtharContent = (content: AtharProviderContent) => {
  const entries = readEntries();
  const next = [{ content, storedAt: Date.now() }, ...entries.filter((entry) => entry.content.id !== content.id)];
  writeEntries(next);
};

export const getCachedAtharContent = (avoidContentIds: string[] = []) => {
  const avoid = new Set(avoidContentIds);
  return readEntries().find((entry) => !avoid.has(entry.content.id))?.content || null;
};

export const getCachedAtharContentByKind = (kind: AtharProviderContent["kind"], avoidContentIds: string[] = []) => {
  const avoid = new Set(avoidContentIds);
  return readEntries().find((entry) => entry.content.kind === kind && !avoid.has(entry.content.id))?.content || null;
};
