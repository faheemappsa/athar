import type { ExperienceContentKind } from "./kind";
import type { AtharExperienceTag } from "./tagList";
import type { UserStage } from "./userStage";

export type ExperienceContent = {
  id: string;
  kind: ExperienceContentKind;
  text: string;
  source: string;
  tags: AtharExperienceTag[];
  stages?: UserStage[];
  weight: number;
  offline: boolean;
};
