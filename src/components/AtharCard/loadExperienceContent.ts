import { resolveContent, resolveDecision } from "../../experience";

export const loadExperienceContent = async () => {
  const decision = resolveDecision();
  return resolveContent(decision);
};
