import type { AtharContentKind, AtharEmotionalState } from "./types";

export type AtharExperienceContentItem = {
  id: string;
  kind: AtharContentKind;
  text: string;
  source: string;
  states: AtharEmotionalState[];
  weight: number;
  offline: boolean;
};
