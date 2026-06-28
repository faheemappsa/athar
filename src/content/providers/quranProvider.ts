import { getAyahByReference } from "../../services/quranApi";
import type { AtharContentProvider } from "../types";

export const QURAN_SHORT_REFERENCES: Record<string, string[]> = {
  sakinah: ["13:28", "20:25", "94:5"],
  raja: ["39:53", "2:186", "94:6"],
  barakah: ["14:7", "65:3", "28:24"],
  sabr: ["2:153", "16:127", "94:5"],
  shukr: ["14:7", "20:114"],
  rizq: ["28:24", "65:3"],
  rahmah: ["39:53", "2:186"],
  thabat: ["3:173", "29:69", "2:153"],
};

const DEFAULT_REFERENCES = ["2:45", "2:153", "2:186", "3:173", "13:28", "14:7", "20:114", "28:24", "65:3", "94:5"];

const pickReference = (state: string, avoidContentIds: string[]) => {
  const statePool = QURAN_SHORT_REFERENCES[state] || DEFAULT_REFERENCES;
  const fresh = statePool.filter((reference) => !avoidContentIds.includes(`quran-${reference}`));
  const pool = fresh.length ? fresh : statePool;
  return pool[Math.floor(Math.random() * pool.length)] || DEFAULT_REFERENCES[0];
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
