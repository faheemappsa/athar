import type { AtharBrainDecision } from "../types";
import { collectProviderItems } from "./collect";
import { pickBestContent } from "./best";
import type { ContentProvider } from "./provider";

export const getBestExperienceContent = async (
  decision: AtharBrainDecision,
  providers: ContentProvider[],
) => {
  const items = await collectProviderItems(decision, providers);
  return pickBestContent(decision, items);
};
