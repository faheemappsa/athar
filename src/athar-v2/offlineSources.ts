export type AtharV2SourceDecision = "seed" | "verify" | "sanitize_only" | "fallback";

export type AtharV2OfflineSource = {
  id: string;
  name: string;
  content: "quran" | "tafsir" | "dua" | "adhkar" | "hadith" | "fallback";
  access: "static_download" | "build_time_fetch" | "manual_import";
  decision: AtharV2SourceDecision;
  liveDisplayAllowed: false;
  notes: string;
};

export const ATHAR_V2_OFFLINE_SOURCES: AtharV2OfflineSource[] = [
  {
    id: "alquran-cloud-seed",
    name: "Al Quran Cloud",
    content: "quran",
    access: "build_time_fetch",
    decision: "seed",
    liveDisplayAllowed: false,
    notes: "Seed only. Never fetch live when opening the Athar card.",
  },
  {
    id: "tanzil-verification",
    name: "Tanzil",
    content: "quran",
    access: "static_download",
    decision: "verify",
    liveDisplayAllowed: false,
    notes: "Verification source for Quran text integrity before generating local JSON.",
  },
  {
    id: "edhafe-tafsir",
    name: "King Saud University Edhafe",
    content: "tafsir",
    access: "manual_import",
    decision: "seed",
    liveDisplayAllowed: false,
    notes: "Use short tafsir, especially Muyassar, as local card meanings.",
  },
  {
    id: "seen-adhkar",
    name: "Morning And Evening Adhkar DB",
    content: "adhkar",
    access: "static_download",
    decision: "seed",
    liveDisplayAllowed: false,
    notes: "Morning and evening adhkar JSON, cleaned and mapped to V2 tags.",
  },
  {
    id: "muslimkit-azkar",
    name: "MuslimKit Azkar JSON",
    content: "dua",
    access: "static_download",
    decision: "seed",
    liveDisplayAllowed: false,
    notes: "Offline source for daily duas and categorized adhkar.",
  },
  {
    id: "hadith-json-filtered",
    name: "Hadith JSON Dataset",
    content: "hadith",
    access: "manual_import",
    decision: "sanitize_only",
    liveDisplayAllowed: false,
    notes: "Raw source only. Keep short authentic Bukhari and Muslim texts after filtering.",
  },
  {
    id: "dorar-sanitization",
    name: "Dorar verification stage",
    content: "hadith",
    access: "manual_import",
    decision: "sanitize_only",
    liveDisplayAllowed: false,
    notes: "Verification during preparation only. No live client API dependency.",
  },
];
