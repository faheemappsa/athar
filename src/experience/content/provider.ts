import type { AtharBrainDecision } from "../types";
import type { ExperienceContent } from "./model";

export type ContentProvider = {
  id: string;
  priority: number;
  get: (decision: AtharBrainDecision) => Promise<ExperienceContent[]> | ExperienceContent[];
};
