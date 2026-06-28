import { recordAtharBehavior } from "./memory";

export const recordContentShown = (contentId?: string) => {
  if (!contentId) return;
  recordAtharBehavior({ type: "surface_view", surface: "athar-card", contentId });
};
