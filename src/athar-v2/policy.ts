import type { AtharV2ContentType, AtharV2Occasion } from "./types";

export const ATHAR_V2_ALLOWED_CONTENT_TYPES: AtharV2ContentType[] = ["ayah", "dua", "hadith", "tafsir"];

export const ATHAR_V2_SUPPORTED_OCCASIONS: AtharV2Occasion[] = [
  "daily_morning",
  "daily_evening",
  "friday",
  "friday_last_hour",
  "monday_preparation",
  "monday_fasting",
  "ramadan",
  "ramadan_last_night",
  "arafah",
  "generic",
];

export const ATHAR_V2_GUARDRAILS = {
  noEmotionBasedSelection: true,
  noRandomApiDisplayOnOpen: true,
  noIndependentPropheticGuidanceSection: true,
  noActionSection: true,
  noReflectionSection: true,
  localLibraryIsPrimaryDisplaySource: true,
  keepLegacySystemUntilV2IsFullyTested: true,
  keepCurrentCardDesignUntouched: true,
  keepImageExportUntouched: true,
  keepSharingFlowUntouched: true,
} as const;
