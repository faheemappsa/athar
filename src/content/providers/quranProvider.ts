import { getAyahByReference } from "../../services/quranApi";
import type { AtharContentProvider } from "../types";

export const QURAN_SHORT_REFERENCES: Record<string, string[]> = {
  sakinah: ["13:28", "20:25", "94:5", "48:4", "9:40", "57:4", "6:103", "50:16"],
  raja: ["39:53", "2:186", "94:6", "12:87", "15:56", "93:5", "65:2", "65:3"],
  barakah: ["14:7", "65:3", "28:24", "11:88", "7:96", "2:261", "24:35", "19:31"],
  sabr: ["2:153", "16:127", "94:5", "3:200", "2:45", "2:155", "2:156", "39:10"],
  shukr: ["14:7", "20:114", "27:19", "34:13", "2:152", "16:18", "55:13", "93:11"],
  rizq: ["28:24", "65:3", "11:6", "51:22", "51:58", "29:60", "34:39", "67:15"],
  rahmah: ["39:53", "2:186", "7:156", "12:64", "6:54", "18:58", "21:83", "21:84"],
  thabat: ["3:173", "29:69", "2:153", "14:27", "8:45", "8:46", "47:7", "41:30"],
};

const DEFAULT_REFERENCES = [
  "2:45",
  "2:153",
  "2:186",
  "3:173",
  "7:156",
  "9:40",
  "13:28",
  "14:7",
  "20:114",
  "24:35",
  "28:24",
  "29:69",
  "39:53",
  "41:30",
  "48:4",
  "51:22",
  "57:4",
  "65:3",
  "93:5",
  "94:5",
  "94:6",
];

const pickReference = (state: string, avoidContentIds: string[]) => {
  const statePool = QURAN_SHORT_REFERENCES[state] || DEFAULT_REFERENCES;
  const fresh = statePool.filter((reference) => !avoidContentIds.includes(`quran-${reference}`));
  const pool = fresh.length ? fresh : DEFAULT_REFERENCES.filter((reference) => !avoidContentIds.includes(`quran-${reference}`));
  const candidates = pool.length ? pool : statePool;
  return candidates[Math.floor(Math.random() * candidates.length)] || DEFAULT_REFERENCES[0];
};

export const quranProvider: AtharContentProvider = {
  id: "quran",
  async getContent(request) {
    if (request.allowNetwork === false || !request.preferredKinds.includes("ayah")) return null;

    const reference = pickReference(request.state, request.avoidContentIds);
    const ayah = await getAyahByReference(reference);
    if (!ayah?.text) return null;

    const source = ayah.surah?.name ? `${ayah.surah.name}: ${ayah.numberInSurah}` : reference;

    return {
      id: `quran-${reference}`,
      provider: "quran",
      kind: "ayah",
      text: ayah.text,
      source,
      stateTags: [request.state],
      weight: 10,
      isShareable: true,
      isOfflineReady: false,
      meta: { reference },
    };
  },
};
