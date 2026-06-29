import type { AtharBrainDecision } from "../experience/types";
import type { AtharContentRequest, AtharProviderContent } from "./types";
import { cacheAtharContent, getCachedAtharContent } from "./cache";
import { quranProvider } from "./providers/quranProvider";
import { tafsirProvider } from "./providers/tafsirProvider";
import { meaningProvider } from "./providers/meaningProvider";
import { asmaProvider } from "./providers/asmaProvider";
import { hadithProvider } from "./providers/hadithProvider";
import { hadithPlusProvider } from "./providers/hadithPlusProvider";
import { extraDuaProvider } from "./providers/extraDuaProvider";
import { localDuaProvider } from "./providers/localDuaProvider";
import { staticProvider } from "./providers/staticProvider";

const networkProviders = [quranProvider, tafsirProvider];
const offlineProviders = [meaningProvider, asmaProvider, hadithPlusProvider, hadithProvider, extraDuaProvider, localDuaProvider, staticProvider];
const providers = [...networkProviders, ...offlineProviders];
const WARM_CACHE_KEY = "athar-warm-cache-at";
const WARM_CACHE_INTERVAL_MS = 8 * 60 * 1000;

const canUseBrowserStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const shouldWarmCache = () => {
  if (!canUseBrowserStorage()) return false;
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;

  try {
    const lastWarmAt = Number(localStorage.getItem(WARM_CACHE_KEY) || 0);
    return Date.now() - lastWarmAt > WARM_CACHE_INTERVAL_MS;
  } catch {
    return false;
  }
};

const markWarmCache = () => {
  if (!canUseBrowserStorage()) return;

  try {
    localStorage.setItem(WARM_CACHE_KEY, String(Date.now()));
  } catch {}
};

const toRequest = (decision: AtharBrainDecision, allowNetwork = true): AtharContentRequest => ({ state: decision.state, preferredKinds: decision.preferredKinds, avoidContentIds: decision.avoidContentIds, allowNetwork });

const getFromProviders = async (request: AtharContentRequest, items: typeof providers): Promise<AtharProviderContent | null> => {
  for (const provider of items) {
    try {
      const content = await provider.getContent(request);
      if (content) return content;
    } catch {}
  }
  return null;
};

export const getAtharContentForDecision = async (decision: AtharBrainDecision): Promise<AtharProviderContent | null> => {
  const request = toRequest(decision, true);
  const onlineContent = await getFromProviders(request, networkProviders);
  if (onlineContent) {
    cacheAtharContent(onlineContent);
    return onlineContent;
  }
  const cached = getCachedAtharContent(decision.avoidContentIds);
  if (cached) return cached;
  const offlineContent = await getFromProviders(toRequest(decision, false), offlineProviders);
  if (offlineContent) {
    cacheAtharContent(offlineContent);
    return offlineContent;
  }
  return null;
};

export const warmAtharContentCache = async (decision: AtharBrainDecision) => {
  if (!shouldWarmCache()) return;
  markWarmCache();

  const warmProviders = [quranProvider, meaningProvider, asmaProvider, extraDuaProvider, staticProvider];
  const request = toRequest(decision, true);

  for (const provider of warmProviders) {
    try {
      const content = await provider.getContent(request);
      if (content) cacheAtharContent(content);
    } catch {}
  }
};
