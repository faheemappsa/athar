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
  const request = toRequest(decision, true);
  await Promise.allSettled(providers.map(async (provider) => {
    const content = await provider.getContent(request);
    if (content) cacheAtharContent(content);
  }));
};
