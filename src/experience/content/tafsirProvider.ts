import type { AtharBrainDecision } from "../types";
import type { ExperienceContent } from "./model";
import { fetchShortTafsir } from "./tafsirFetch";

export const getTafsirContent = async (decision: AtharBrainDecision): Promise<ExperienceContent[]> => {
  const result = await fetchShortTafsir(decision.generatedAt);
  if (!result.text) return [];

  return [
    {
      id: `tafsir-${result.verseKey}`,
      kind: "tafsir",
      text: result.text,
      source: result.verseKey,
      tags: [decision.state],
      weight: 7,
      offline: false,
    },
  ];
};
