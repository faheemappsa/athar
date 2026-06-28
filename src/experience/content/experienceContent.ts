import type { AtharBrainDecision } from "../types";
import { getBestExperienceContent } from "./manager";
import { EXPERIENCE_CONTENT_PROVIDERS } from "./registry";

export const resolveExperienceContent = (decision: AtharBrainDecision) => {
  return getBestExperienceContent(decision, EXPERIENCE_CONTENT_PROVIDERS);
};
