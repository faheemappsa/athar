import { ATHAR_LIBRARY, type AtharItem, type AtharKind, type AtharTime } from "../data/atharLibrary";
import { recordAtharBehavior } from "../experience/memory";
import { getAyahByReference, getRandomAyah } from "./quranApi";
import { readAtharRecentIds, rememberAtharContentId } from "./atharRotation";

export type AtharContent = {
  id: string;
  text: string;
  source: string;
  kind: AtharItem["kind"] | "external-ayah";
  time: AtharTime;
};

type MixKind = AtharKind;
type QueueItem = AtharContent;

type QuranBankItem = {
  ref: string;
  times: AtharTime[];
};

type WeightedKind = {
  kind: MixKind;
  weight: number;
};

const QUEUE_KEY = "athar-content-queue";
const KIND_HISTORY_KEY = "athar-kind-history";
const QUEUE_TARGET_SIZE = 10;
const QUEUE_REFILL_AT = 4;
const MAX_KIND_HISTORY = 6;

const QURAN_BANK: QuranBankItem[] = [
  { ref: "2:45", times: ["pressure", "any"] },
  { ref: "2:153", times: ["pressure", "any"] },
  { ref: "2:155", times: ["pressure", "any"] },
  { ref: "2:156", times: ["pressure", "any"] },
  { ref: "2:186", times: ["night", "any"] },
  { ref: "3:173", times: ["morning", "pressure", "any"] },
  { ref: "7:56", times: ["night", "any"] },
  { ref: "7:96", times: ["morning", "any"] },
  { ref: "7:156", times: ["night", "any"] },
  { ref: "9:40", times: ["pressure", "night", "any"] },
  { ref: "11:6", times: ["morning", "any"] },
  { ref: "11:88", times: ["morning", "pressure", "any"] },
  { ref: "12:18", times: ["pressure", "night", "any"] },
  { ref: "12:64", times: ["night", "any"] },
  { ref: "12:87", times: ["night", "any"] },
  { ref: "13:28", times: ["pressure", "night", "any"] },
  { ref: "14:7", times: ["morning", "any"] },
  { ref: "14:27", times: ["pressure", "any"] },
  { ref: "16:18", times: ["morning", "any"] },
  { ref: "16:127", times: ["pressure", "any"] },
  { ref: "18:58", times: ["night", "any"] },
  { ref: "20:25", times: ["morning", "pressure", "any"] },
  { ref: "20:26", times: ["morning", "pressure", "any"] },
  { ref: "20:114", times: ["morning", "any"] },
  { ref: "21:83", times: ["pressure", "night", "any"] },
  { ref: "21:84", times: ["night", "any"] },
  { ref: "24:35", times: ["night", "any"] },
  { ref: "27:19", times: ["morning", "any"] },
  { ref: "28:24", times: ["morning", "night", "any"] },
  { ref: "29:60", times: ["morning", "any"] },
  { ref: "29:69", times: ["morning", "any"] },
  { ref: "34:39", times: ["morning", "any"] },
  { ref: "39:10", times: ["pressure", "any"] },
  { ref: "39:53", times: ["night", "any"] },
  { ref: "41:30", times: ["night", "any"] },
  { ref: "48:4", times: ["pressure", "night", "any"] },
  { ref: "51:22", times: ["morning", "any"] },
  { ref: "51:58", times: ["morning", "any"] },
  { ref: "55:13", times: ["morning", "any"] },
  { ref: "57:4", times: ["night", "any"] },
  { ref: "65:2", times: ["pressure", "any"] },
  { ref: "65:3", times: ["morning", "any"] },
  { ref: "67:15", times: ["morning", "any"] },
  { ref: "93:5", times: ["morning", "any"] },
  { ref: "93:11", times: ["morning", "any"] },
  { ref: "94:5", times: ["pressure", "night", "any"] },
  { ref: "94:6", times: ["pressure", "night", "any"] },
];

const getTimeContext = (): AtharTime => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 18) return "pressure";
  if (hour >= 20 || hour < 5) return "night";
  return "any";
};

const getKindForMix = (kind: AtharContent["kind"]): MixKind => (kind === "external-ayah" ? "ayah" : kind);

const readJsonArray = <T,>(key: string): T[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const writeJsonArray = <T,>(key: string, value: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const readQueue = () => readJsonArray<QueueItem>(QUEUE_KEY).filter((item) => item?.id && item?.text && item?.source && item?.kind);
const writeQueue = (queue: QueueItem[]) => writeJsonArray(QUEUE_KEY, queue.slice(0, QUEUE_TARGET_SIZE));

const readKindHistory = () => readJsonArray<MixKind>(KIND_HISTORY_KEY).filter(Boolean).slice(0, MAX_KIND_HISTORY);
const rememberKind = (kind: MixKind) => writeJsonArray(KIND_HISTORY_KEY, [kind, ...readKindHistory()].slice(0, MAX_KIND_HISTORY));

const wouldExceedKindStreak = (kind: MixKind, history = readKindHistory()) => history[0] === kind && history[1] === kind;

const saveShownContent = (content: AtharContent) => {
  const kind = getKindForMix(content.kind);
  rememberAtharContentId(content.id);
  rememberKind(kind);
  recordAtharBehavior({ type: "surface_view", surface: "athar-card", contentId: content.id, metadata: { kind } });
};

const getWeights = (time: AtharTime): WeightedKind[] => {
  if (time === "morning") {
    return [
      { kind: "ayah", weight: 35 },
      { kind: "dua", weight: 35 },
      { kind: "hadith", weight: 20 },
      { kind: "wisdom", weight: 10 },
    ];
  }

  if (time === "night") {
    return [
      { kind: "dua", weight: 35 },
      { kind: "ayah", weight: 30 },
      { kind: "wisdom", weight: 20 },
      { kind: "hadith", weight: 15 },
    ];
  }

  return [
    { kind: "ayah", weight: 40 },
    { kind: "dua", weight: 35 },
    { kind: "wisdom", weight: 15 },
    { kind: "hadith", weight: 10 },
  ];
};

const pickWeightedKind = (time: AtharTime, history: MixKind[]): MixKind => {
  const weighted = getWeights(time).map((item) => ({ ...item, weight: wouldExceedKindStreak(item.kind, history) ? 0 : item.weight }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return getWeights(time).find((item) => item.kind !== history[0])?.kind || "dua";

  let cursor = Math.random() * total;
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) return item.kind;
  }

  return weighted[0]?.kind || "dua";
};

const getLocalPool = (time: AtharTime, kind: MixKind, recent: string[]) => {
  const pool = ATHAR_LIBRARY.filter((item) => item.kind === kind && (item.times.includes(time) || item.times.includes("any")));
  const fresh = pool.filter((item) => !recent.includes(item.id));
  return fresh.length ? fresh : pool;
};

const toContent = (item: AtharItem, time: AtharTime): AtharContent => ({
  id: item.id,
  text: item.text,
  source: item.source,
  kind: item.kind,
  time,
});

const pickLocalContent = (time: AtharTime, kind: MixKind, usedIds: string[]): AtharContent | null => {
  const recent = Array.from(new Set([...readAtharRecentIds(), ...usedIds]));
  const pool = getLocalPool(time, kind, recent);
  const selected = pool[Math.floor(Math.random() * pool.length)];
  return selected ? toContent(selected, time) : null;
};

const buildLocalQueue = (time: AtharTime, size = QUEUE_TARGET_SIZE): QueueItem[] => {
  const queue: QueueItem[] = [];
  const usedIds: string[] = [];
  let history = readKindHistory();

  while (queue.length < size) {
    const preferredKind = pickWeightedKind(time, history);
    const fallbackKinds = getWeights(time)
      .map((item) => item.kind)
      .filter((kind) => kind !== preferredKind && !wouldExceedKindStreak(kind, history));
    const kindOptions = [preferredKind, ...fallbackKinds];
    const content = kindOptions.map((kind) => pickLocalContent(time, kind, usedIds)).find(Boolean) || null;

    if (!content) break;

    const kind = getKindForMix(content.kind);
    queue.push(content);
    usedIds.push(content.id);
    history = [kind, ...history].slice(0, MAX_KIND_HISTORY);
  }

  return queue;
};

const isShortArabicAyah = (text: string) => {
  const clean = text.replace(/[\u064B-\u065F\u0670]/g, "").trim();
  return clean.length >= 14 && clean.length <= 120;
};

const pickTaggedQuranRef = (time: AtharTime) => {
  const recent = readAtharRecentIds();
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

  return {
    id: `quran-${selected.ref}`,
    text: ayah.text,
    source: ayah.surah?.name ? `${ayah.surah.name}: ${ayah.numberInSurah}` : "القرآن الكريم",
    kind: "external-ayah",
    time,
  };
};

const getRandomQuranAthar = async (time: AtharTime): Promise<AtharContent | null> => {
  const ayah = await getRandomAyah();
  if (!ayah?.text || !isShortArabicAyah(ayah.text)) return null;

  return {
    id: `external-${ayah.number}`,
    text: ayah.text,
    source: ayah.surah?.name ? `${ayah.surah.name}: ${ayah.numberInSurah}` : "القرآن الكريم",
    kind: "external-ayah",
    time,
  };
};

const addExternalAyahToQueue = async (time: AtharTime) => {
  try {
    const queue = readQueue();
    const ayahCount = queue.filter((item) => getKindForMix(item.kind) === "ayah").length;
    if (queue.length >= QUEUE_TARGET_SIZE || ayahCount >= 3) return;

    const content = (await getTaggedQuranAthar(time)) || (await getRandomQuranAthar(time));
    if (!content) return;

    const recent = readAtharRecentIds();
    const currentQueue = readQueue();
    if (recent.includes(content.id) || currentQueue.some((item) => item.id === content.id)) return;

    writeQueue([...currentQueue, content]);
  } catch {}
};

const refillQueue = (time: AtharTime, currentQueue: QueueItem[]) => {
  const cleaned = currentQueue.filter((item) => item.time === time || item.time === "any");
  const needed = Math.max(0, QUEUE_TARGET_SIZE - cleaned.length);
  if (!needed) {
    writeQueue(cleaned);
    return cleaned;
  }

  const generated = buildLocalQueue(time, needed).filter((item) => !cleaned.some((queued) => queued.id === item.id));
  const next = [...cleaned, ...generated].slice(0, QUEUE_TARGET_SIZE);
  writeQueue(next);
  void addExternalAyahToQueue(time);
  return next;
};

const takeNextFromQueue = (time: AtharTime, queue: QueueItem[]) => {
  const recent = readAtharRecentIds();
  const remaining = [...queue];

  while (remaining.length) {
    const next = remaining.shift();
    if (!next) continue;
    const kind = getKindForMix(next.kind);
    if (next.time !== time && next.time !== "any") continue;
    if (recent.includes(next.id)) continue;
    if (wouldExceedKindStreak(kind)) continue;
    return { next, remaining };
  }

  return { next: null, remaining: [] as QueueItem[] };
};

export const getSmartAthar = async (): Promise<AtharContent> => {
  const time = getTimeContext();
  const queue = refillQueue(time, readQueue());
  let { next, remaining } = takeNextFromQueue(time, queue);

  if (!next) {
    const rebuilt = buildLocalQueue(time, QUEUE_TARGET_SIZE);
    ({ next, remaining } = takeNextFromQueue(time, rebuilt));
  }

  const fallback = next || pickLocalContent(time, "dua", []) || pickLocalContent(time, "ayah", []) || toContent(ATHAR_LIBRARY[0], time);
  saveShownContent(fallback);

  const refreshedQueue = remaining.length <= QUEUE_REFILL_AT ? refillQueue(time, remaining) : remaining;
  writeQueue(refreshedQueue);

  return fallback;
};
