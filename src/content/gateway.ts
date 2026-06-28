import type { AtharBrainDecision } from "../experience/types";
import type { AtharContentRequest, AtharProviderContent } from "./types";
import { cacheAtharContent, getCachedAtharContent } from "./cache";
import { quranProvider } from "./providers/quranProvider";
import { tafsirProvider } from "./providers/tafsirProvider";
import { asmaProvider } from "./providers/asmaProvider";
import { hadithProvider } from "./providers/hadithProvider";
import { localDuaProvider } from "./providers/localDuaProvider";
import { staticProvider } from "./providers/staticProvider";

const providers = [quranProvider, tafsirProvider, asmaProvider, hadithProvider, localDuaProvider, staticProvider];

const toRequest = (decision: AtharBrainDecision, allowNetwork = true): AtharContentRequest => ({
  state: decision.state,
  preferredKinds: decision.preferredKinds,
  avoidContentIds: decision.avoidContentIds,
  allowNetwork,
});

export const getAtharContentForDecision = async (decision: AtharBrainDecision): Promise<AtharProviderContent | null> => {
  const cached = getCachedAtharContent(decision.avoidContentIds);
  const request = toRequest(decision, true);

  for (const provider of providers) {
    try {
      const content = await provider.getContent(request);
      if (content) {
        cacheAtharContent(content);
        return content;
      }
    } catch {}
  }

  return cached;
};

export const warmAtharContentCache = async (decision: AtharBrainDecision) => {
  const request = toRequest(decision, true);

  await Promise.allSettled(
    providers.map(async (provider) => {
      const content = await provider.getContent(request);
      if (content) cacheAtharContent(content);
    }),
  );
};
