export const ATHAR_V2_SOURCE_STACK = [
  { id: "al-quran-cloud-seed", name: "Al Quran Cloud", mode: "seed-only", liveDisplayFetch: false },
  { id: "tanzil-verify", name: "Tanzil", mode: "verify-only", liveDisplayFetch: false },
  { id: "edhafe-tafsir", name: "King Saud University Edhafe", mode: "build-import", liveDisplayFetch: false },
  { id: "seen-adhkar", name: "Morning And Evening Adhkar DB", mode: "build-import", liveDisplayFetch: false },
  { id: "muslimkit-azkar", name: "MuslimKit Azkar JSON", mode: "build-import", liveDisplayFetch: false },
  { id: "hadith-json-filtered", name: "Hadith JSON Dataset", mode: "filtered-build-import", liveDisplayFetch: false },
];

export const ATHAR_V2_PIPELINE_RULES = {
  maxTextLength: 150,
  allowedTypes: ["ayah", "dua", "hadith", "tafsir"],
  rejectLiveDisplayApi: true,
  localDbPath: "public/data/athar-v2/athar-db.json",
};
