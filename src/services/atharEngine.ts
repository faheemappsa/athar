import { ATHAR_LIBRARY, type AtharItem, type AtharTag, type AtharTime } from "../data/atharLibrary";
import { readLastAtharBrainDecision } from "../experience/brain";
import { recordAtharBehavior } from "../experience/memory";
import { getAtharContentForDecision, warmAtharContentCache } from "../content/gateway";
import { getAyahByReference, getRandomAyah } from "./quranApi";
import { readAtharRecentIds, rememberAtharContentId } from "./atharRotation";

export type AtharContent = {
  id: string;
  text: string;
  source: string;
  kind: AtharItem["kind"] | "external-ayah";
  time: AtharTime;
};

type QuranBankItem = {
  ref: string;
  times: AtharTime[];
  tags: AtharTag[];
};

const QURAN_BANK: QuranBankItem[] = [
  { ref: "2:45", times: ["pressure", "any"], tags: ["sabr", "sakinah"] },
  { ref: "2:153", times: ["pressure", "any"], tags: ["sabr", "thabat"] },
  { ref: "2:155", times: ["pressure", "any"], tags: ["sabr"] },
  { ref: "2:156", times: ["pressure", "any"], tags: ["sabr"] },
  { ref: "2:186", times: ["night", "any"], tags: ["rahmah", "raja"] },
  { ref: "3:173", times: ["morning", "pressure", "any"], tags: ["tawakkul", "thabat"] },
  { ref: "7:56", times: ["night", "any"], tags: ["rahmah", "raja"] },
  { ref: "7:96", times: ["morning", "any"], tags: ["barakah"] },
  { ref: "7:156", times: ["night", "any"], tags: ["rahmah", "raja"] },
  { ref: "9:40", times: ["pressure", "night", "any"], tags: ["sakinah", "thabat"] },
  { ref: "11:6", times: ["morning", "any"], tags: ["rizq"] },
  { ref: "11:88", times: ["morning", "pressure", "any"], tags: ["tawakkul", "yusr"] },
  { ref: "12:18", times: ["pressure", "night", "any"], tags: ["sabr", "raja"] },
  { ref: "12:64", times: ["night", "any"], tags: ["rahmah"] },
  { ref: "12:87", times: ["night", "any"], tags: ["raja"] },
  { ref: "13:28", times: ["pressure", "night", "any"], tags: ["sakinah", "raja"] },
  { ref: "14:7", times: ["morning", "any"], tags: ["shukr", "barakah"] },
  { ref: "14:27", times: ["pressure", "any"], tags: ["thabat"] },
  { ref: "16:18", times: ["morning", "any"], tags: ["shukr"] },
  { ref: "16:127", times: ["pressure", "any"], tags: ["sabr", "tawakkul"] },
  { ref: "18:58", times: ["night", "any"], tags: ["rahmah"] },
  { ref: "20:25", times: ["morning", "pressure", "any"], tags: ["sakinah", "yusr"] },
  { ref: "20:26", times: ["morning", "pressure", "any"], tags: ["yusr", "barakah"] },
  { ref: "20:114", times: ["morning", "any"], tags: ["hidayah", "focus"] },
  { ref: "21:83", times: ["pressure", "night", "any"], tags: ["rahmah", "sabr"] },
  { ref: "21:84", times: ["night", "any"], tags: ["rahmah"] },
  { ref: "24:35", times: ["night", "any"], tags: ["sakinah", "barakah"] },
  { ref: "27:19", times: ["morning", "any"], tags: ["shukr"] },
  { ref: "28:24", times: ["morning", "night", "any"], tags: ["rizq", "tawakkul"] },
  { ref: "29:60", times: ["morning", "any"], tags: ["rizq"] },
  { ref: "29:69", times: ["morning", "any"], tags: ["hidayah", "thabat"] },
  { ref: "34:39", times: ["morning", "any"], tags: ["rizq", "barakah"] },
  { ref: "39:10", times: ["pressure", "any"], tags: ["sabr"] },
  { ref: "39:53", times: ["night", "any"], tags: ["rahmah", "raja"] },
  { ref: "41:30", times: ["night", "any"], tags: ["thabat", "sakinah"] },
  { ref: "48:4", times: ["pressure", "night", "any"], tags: ["sakinah"] },
  { ref: "51:22", times: ["morning", "any"], tags: ["rizq"] },
  { ref: "51:58", times: ["morning", "any"], tags: ["rizq"] },
  { ref: "55:13", times: ["morning", "any"], tags: ["shukr"] },
  { ref: "57:4", times: ["night", "any"], tags: ["sakinah"] },
  { ref: "65:2", times: ["pressure", "any"], tags: ["raja", "tawakkul"] },
  { ref: "65:3", times: ["morning", "any"], tags: ["tawakkul", "barakah", "rizq"] },
  { ref: "67:15", times: ["morning", "any"], tags: ["rizq"] },
  { ref: "93:5", times: ["morning", "any"], tags: ["raja"] },
  { ref: "93:11", times: ["morning", "any"], tags: ["shukr"] },
  { ref: "94:5", times: ["pressure", "night", "any"], tags: ["sabr", "yusr"] },
  { ref: "94:6", times: ["pressure", "night", "any"], tags: ["sabr", "yusr"] },
];

const getTimeContext = (): AtharTime => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 13 && hour < 16) return "pressure";
  if (hour >= 23 || hour < 3) return "night";
  return "any";
};

const readRecentIds = readAtharRecentIds;

const saveRecentId = (id: string) => {
  rememberAtharContentId(id);
  recordAtharBehavior({ type: "surface_view", surface: "athar-card", contentId: id });
};

const mergeAvoidIds = (ids: string[] = []) => Array.from(new Set([...ids, ...readRecentIds()])).slice(0, 40);

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
  return clean.length >= 14 && clean.length <= 120;
};

const pickTaggedQuranRef = (time: AtharTime) => {
  const recent = readRecentIds();
  const pool = QURAN_BANK.filter((item) => item.times.includes(time) || item.times.includes("any"));
  const fresh = pool.filter((item) => !recent.includes(`quran-${item.ref}`));
  const candidates = fresh.length ? fresh : pool;
  return candidates[Math.floor(Math.random() * candidates.length)] || QURAN_BANK[0];
};

const getTaggedQuranAthar = async (time: AtharTime): Promise<AtharContent | null> => {
  const selected = pickTaggedQuranRef(time);
  if (!selected) return null;

  const ayah = await getAyahByReference(selected.ref);
  if (!ayah?.text || !isShortArabicAyah(ayah.text)) return null;

  const id = `quran-${selected.ref}`;
  saveRecentId(id);
  return {
    id,
    text: ayah.text,
    source: ayah.surah?.name ? `${ayah.surah.name}: ${ayah.numberInSurah}` : "القرآن الكريم",
    kind: "external-ayah",
    time,
  };
};

const getRandomQuranAthar = async (time: AtharTime): Promise<AtharContent | null> => {
  const ayah = await getRandomAyah();
  if (!ayah?.text || !isShortArabicAyah(ayah.text)) return null;

  const id = `external-${ayah.number}`;
  saveRecentId(id);
  return {
    id,
    text: ayah.text,
    source: ayah.surah?.name ? `${ayah.surah.name}: ${ayah.numberInSurah}` : "القرآن الكريم",
    kind: "external-ayah",
    time,
  };
};

const getBrainGuidedAthar = async (time: AtharTime): Promise<AtharContent | null> => {
  const decision = readLastAtharBrainDecision();
  if (!decision) return null;

  const freshDecision = { ...decision, avoidContentIds: mergeAvoidIds(decision.avoidContentIds) };
  const content = await getAtharContentForDecision(freshDecision);
  void warmAtharContentCache(freshDecision);
  if (!content) return null;

  saveRecentId(content.id);
  return {
    id: content.id,
    text: content.text,
    source: content.source,
    kind: content.kind === "ayah" ? "external-ayah" : (content.kind as AtharItem["kind"]),
    time,
  };
};

export const getSmartAthar = async (): Promise<AtharContent> => {
  const time = getTimeContext();

  try {
    const brainContent = await getBrainGuidedAthar(time);
    if (brainContent) return brainContent;
  } catch {}

  try {
    if (Math.random() < 0.65) {
      const tagged = await getTaggedQuranAthar(time);
      if (tagged) return tagged;
    }

    if (Math.random() < 0.25) {
      const random = await getRandomQuranAthar(time);
      if (random) return random;
    }
  } catch {}

  return pickFromLibrary(time);
};
