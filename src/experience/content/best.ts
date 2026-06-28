import type { AtharBrainDecision } from "../types";
import type { ExperienceContent } from "./model";
import { rankExperienceContent } from "./ranker";

export const pickBestContent = (
  decision: AtharBrainDecision,
  items: ExperienceContent[],
): ExperienceContent | null => {
  if (!items.length) return null;

  return items
    .slice()
    .sort((a, b) => rankExperienceContent(b, decision) - rankExperienceContent(a, decision))[0];
};
