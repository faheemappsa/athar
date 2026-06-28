import type { AtharContent } from "../../services/atharEngine";
import type { ExperienceContent } from "../../experience/content";

const toCardKind = (kind: ExperienceContent["kind"]): AtharContent["kind"] => {
  if (kind === "tafsir" || kind === "asma") return "wisdom";
  return kind;
};

export const toAtharContent = (content: ExperienceContent): AtharContent => ({
  id: content.id,
  text: content.text,
  source: content.source,
  kind: toCardKind(content.kind),
  time: "any",
});
