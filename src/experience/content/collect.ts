import type { AtharBrainDecision } from "../types";
import type { ExperienceContent } from "./model";
import type { ContentProvider } from "./provider";

export const collectProviderItems = async (
  decision: AtharBrainDecision,
  providers: ContentProvider[],
): Promise<ExperienceContent[]> => {
  const groups = await Promise.all(providers.map((provider) => provider.get(decision)));
  return groups.flat();
};
