import type { AtharBrainDecision } from "../types";
import type { ExperienceContent } from "./model";

const QURAN_API_BASE = "https://api.quran.com/api/v4";

const SHORT_VERSES = ["94:5", "94:6", "65:3", "13:28", "2:286", "93:5"];

export const fetchQuranContent = async (decision: AtharBrainDecision): Promise<ExperienceContent[]> => {
  const verseKey = SHORT_VERSES[decision.generatedAt % SHORT_VERSES.length];
  const response = await fetch(`${QURAN_API_BASE}/verses/by_key/${verseKey}?fields=text_uthmani`);
  const data = await response.json();

  if (!data?.verse?.text_uthmani) return [];

  return [
    {
      id: `quran-${verseKey}`,
      kind: "ayah",
      text: data.verse.text_uthmani,
      source: `القرآن الكريم ${verseKey}`,
      tags: [decision.state],
      weight: 9,
      offline: false,
    },
  ];
};
