import type { AtharBrainDecision } from "./types";
import { resolveExperienceContent } from "./content/experienceContent";

export const resolveContent = (decision: AtharBrainDecision) => resolveExperienceContent(decision);
