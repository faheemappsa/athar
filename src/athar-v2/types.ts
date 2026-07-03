export type AtharV2ContentType = "ayah" | "dua" | "hadith" | "tafsir";

export type AtharV2Occasion =
  | "daily_morning"
  | "daily_evening"
  | "friday"
  | "friday_last_hour"
  | "monday_preparation"
  | "monday_fasting"
  | "ramadan"
  | "ramadan_last_night"
  | "arafah"
  | "generic";

export type AtharV2Tag =
  | "dua"
  | "hope"
  | "mercy"
  | "forgiveness"
  | "tawakkul"
  | "rizq"
  | "barakah"
  | "morning"
  | "evening"
  | "friday"
  | "fasting"
  | "ramadan"
  | "arafah"
  | "tawhid"
  | "quran_meaning"
  | "short";

export type AtharV2Source = {
  title: string;
  reference: string;
  verifier?: string;
  url?: string;
};

export type AtharV2Item = {
  id: string;
  type: AtharV2ContentType;
  text: string;
  source: AtharV2Source;
  tags: AtharV2Tag[];
  occasions: AtharV2Occasion[];
  priority: number;
  weight: number;
};

export type AtharV2MomentInput = {
  now?: Date;
  /** Hijri month number, Ramadan = 9. Optional until a trusted calendar provider is connected. */
  hijriMonth?: number;
  /** Hijri day number. Arafah = 9 Dhul Hijjah when hijriMonth = 12. */
  hijriDay?: number;
  /** Optional override for deterministic tests or future server-side scheduling. */
  occasionOverride?: AtharV2Occasion;
};

export type AtharV2Moment = {
  now: Date;
  day: number;
  hour: number;
  occasion: AtharV2Occasion;
  secondaryOccasions: AtharV2Occasion[];
  valueTags: AtharV2Tag[];
};

export type AtharV2SelectionOptions = AtharV2MomentInput & {
  recentIds?: string[];
  limit?: number;
};

export type AtharV2SelectionResult = {
  item: AtharV2Item;
  moment: AtharV2Moment;
  poolSize: number;
  reason: string;
};
