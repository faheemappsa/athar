import type { AtharBrainDecision } from "../types";
import { collectProviderItems } from "./collect";
import { pickBestContent } from "./best";
import { readContentCache, saveContentToCache } from "./cache";
import type { ContentProvider } from "./provider";

export const getBestExperienceContent = async (
  decision: AtharBrainDecision,
  providers: ContentProvider[],
) => {
  const cachedItems = readContentCache();
  const liveItems = await collectProviderItems(decision, providers);
  liveItems.forEach(saveContentToCache);

  return pickBestContent(decision, [...liveItems, ...cachedItems]);
};
