import type { AtharMemorySnapshot } from "../types";
import type { UserStage } from "./userStage";

export const resolveUserStage = (memory: AtharMemorySnapshot): UserStage => {
  if (memory.visitCount >= 14) return "habit";
  if (memory.visitCount >= 2) return "back";
  return "new";
};
