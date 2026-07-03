import { ATHAR_V2_CATALOG } from "./catalog";

export function getAtharV2CoverageReport() {
  const byType: Record<string, number> = { ayah: 0, dua: 0, hadith: 0, tafsir: 0 };
  const byOccasion: Record<string, number> = {
    daily_morning: 0,
    daily_evening: 0,
    friday: 0,
    friday_last_hour: 0,
    monday_preparation: 0,
    monday_fasting: 0,
    ramadan: 0,
    ramadan_last_night: 0,
    arafah: 0,
    generic: 0,
  };

  for (const item of ATHAR_V2_CATALOG) {
    byType[item.type] = (byType[item.type] ?? 0) + 1;
    for (const occasion of item.occasions) {
      byOccasion[occasion] = (byOccasion[occasion] ?? 0) + 1;
    }
  }

  const missingTypes = Object.keys(byType).filter((key) => byType[key] === 0);
  const missingOccasions = Object.keys(byOccasion).filter((key) => byOccasion[key] === 0);

  return { total: ATHAR_V2_CATALOG.length, byType, byOccasion, missingTypes, missingOccasions };
}
