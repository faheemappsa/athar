import type { AtharBrainDecision } from "../types";
import { readAtharMemory } from "../memory";
import type { ExperienceContent } from "./model";
import { resolveUserStage } from "./userStageResolver";

export const rankExperienceContent = (item: ExperienceContent, decision: AtharBrainDecision) => {
  const memory = readAtharMemory();
  const stage = resolveUserStage(memory);
  let rank = item.weight;

  if (item.tags.includes(decision.state)) rank += 8;
  if (item.stages?.includes(stage)) rank += 3;
  if (item.offline) rank += 0.5;

  const kindIndex = decision.preferredKinds.indexOf(item.kind as never);
  if (kindIndex >= 0) rank += Math.max(1, 5 - kindIndex);

  if (decision.avoidContentIds.includes(item.id)) rank -= 50;

  return rank;
};
