import type { AtharContent } from "../../services/atharEngine";
import type { ExperienceContent } from "../../experience/content";

export const toAtharContent = (content: ExperienceContent): AtharContent => ({
  id: content.id,
  text: content.text,
  source: content.source,
  kind: content.kind === "asma" ? "wisdom" : content.kind,
  time: "any",
});
