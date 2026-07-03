import type { AtharV2ContentType } from "./types";

export type AtharV2SourceRule = {
  type: AtharV2ContentType;
  acceptedSources: string[];
  note: string;
};

export const ATHAR_V2_SOURCE_RULES: AtharV2SourceRule[] = [
  {
    type: "ayah",
    acceptedSources: ["القرآن الكريم"],
    note: "Ayah text must come from the Quran only with surah and ayah reference.",
  },
  {
    type: "dua",
    acceptedSources: ["القرآن الكريم", "صحيح البخاري", "صحيح مسلم", "سنن أبي داود", "سنن الترمذي", "سنن ابن ماجه"],
    note: "Dua must be short and traceable to Quran or accepted hadith collections.",
  },
  {
    type: "hadith",
    acceptedSources: ["صحيح البخاري", "صحيح مسلم", "صحيح البخاري وصحيح مسلم", "سنن الترمذي"],
    note: "Hadith must be authentic or explicitly marked with a reliable grading.",
  },
  {
    type: "tafsir",
    acceptedSources: ["تفسير السعدي", "تفسير ابن كثير", "تفسير ابن كثير والسعدي"],
    note: "Meaning text must be brief, non-expansive, and attributed to known tafsir sources.",
  },
];

export function getAtharV2SourceRule(type: AtharV2ContentType) {
  return ATHAR_V2_SOURCE_RULES.find((rule) => rule.type === type);
}
