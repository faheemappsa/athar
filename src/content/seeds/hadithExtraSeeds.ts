import type { AtharProviderContent } from "../types";

export const HADITH_EXTRA_SEEDS: AtharProviderContent[] = [
  {
    id: "hadith-mercy",
    provider: "hadith",
    kind: "hadith",
    text: "الراحمون يرحمهم الرحمن، ارحموا من في الأرض يرحمكم من في السماء.",
    source: "حديث صحيح",
    stateTags: ["rahmah", "raja"],
    weight: 8,
    isShareable: true,
    isOfflineReady: true,
  },
  {
    id: "hadith-tawakkul",
    provider: "hadith",
    kind: "hadith",
    text: "احرص على ما ينفعك، واستعن بالله ولا تعجز.",
    source: "صحيح مسلم",
    stateTags: ["thabat", "sabr"],
    weight: 8,
    isShareable: true,
    isOfflineReady: true,
  },
];
