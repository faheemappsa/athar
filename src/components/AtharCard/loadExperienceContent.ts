import { resolveContent, resolveDecision } from "../../experience";
import { toAtharContent } from "./toAtharContent";

export const loadExperienceContent = async () => {
  const decision = resolveDecision();
  const content = await resolveContent(decision);
  return content ? toAtharContent(content) : null;
};
