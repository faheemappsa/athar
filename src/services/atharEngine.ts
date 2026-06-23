import { ATHAR_LIBRARY, type AtharItem, type AtharTime } from "../data/atharLibrary";
import { getRandomAyah } from "./quranApi";

export type AtharContent = {
  id: string;
  text: string;
  source: string;
  kind: AtharItem["kind"] | "external-ayah";
  time: AtharTime;
};

const getTimeContext = (): AtharTime => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 13 && hour < 16) return "pressure";
  if (hour >= 23 || hour < 3) return "night";
  return "any";
};

const readRecentIds = () => {
  try {
    return JSON.parse(localStorage.getItem("athar-recent-ids") || "[]") as string[];
  } catch {
    return [];
  }
};

const saveRecentId = (id: string) => {
  try {
    const next = [id, ...readRecentIds().filter((item) => item !== id)].slice(0, 8);
    localStorage.setItem("athar-recent-ids", JSON.stringify(next));
  } catch {}
};

const pickFromLibrary = (time: AtharTime): AtharContent => {
  const recent = readRecentIds();
  const pool = ATHAR_LIBRARY.filter((item) => item.times.includes(time) || item.times.includes("any"));
  const fresh = pool.filter((item) => !recent.includes(item.id));
  const candidates = fresh.length ? fresh : pool;
  const selected = candidates[Math.floor(Math.random() * candidates.length)] || ATHAR_LIBRARY[0];
  saveRecentId(selected.id);
  return {
    id: selected.id,
    text: selected.text,
    source: selected.source,
    kind: selected.kind,
    time,
  };
};

const isShortArabicAyah = (text: string) => {
  const clean = text.replace(/[\u064B-\u065F\u0670]/g, "").trim();
  return clean.length >= 18 && clean.length <= 105;
};

export const getSmartAthar = async (): Promise<AtharContent> => {
  const time = getTimeContext();

  try {
    if (Math.random() < 0.35) {
      const ayah = await getRandomAyah();
      if (ayah?.text && isShortArabicAyah(ayah.text)) {
        const content = {
          id: `external-${ayah.number}`,
          text: ayah.text,
          source: ayah.surah?.name ? `${ayah.surah.name}: ${ayah.numberInSurah}` : "القرآن الكريم",
          kind: "external-ayah" as const,
          time,
        };
        saveRecentId(content.id);
        return content;
      }
    }
  } catch {}

  return pickFromLibrary(time);
};
