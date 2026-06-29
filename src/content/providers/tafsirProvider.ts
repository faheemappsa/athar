import { QURAN_SHORT_REFERENCES } from "./quranProvider";
import type { AtharContentProvider } from "../types";

const QURAN_API_BASE = "https://api.quran.com/api/v4";
const TAFSIR_MUYASSAR_ID = 16;
const TAFSIR_TIMEOUT_MS = 7000;

const DEFAULT_REFERENCES = ["2:45", "2:153", "2:186", "13:28", "14:7", "20:114", "65:3", "94:5"];

const pickReference = (state: string, avoidContentIds: string[]) => {
  const statePool = QURAN_SHORT_REFERENCES[state] || DEFAULT_REFERENCES;
  const fresh = statePool.filter((reference) => !avoidContentIds.includes(`tafsir-${reference}`));
  const pool = fresh.length ? fresh : statePool;
  return pool[Math.floor(Math.random() * pool.length)] || DEFAULT_REFERENCES[0];
};

const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TAFSIR_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
};

export const tafsirProvider: AtharContentProvider = {
  id: "tafsir",
  async getContent(request) {
    if (request.allowNetwork === false || !request.preferredKinds.includes("tafsir")) return null;

    try {
      const reference = pickReference(request.state, request.avoidContentIds);
      const data = await fetchWithTimeout(`${QURAN_API_BASE}/quran/tafsirs/${TAFSIR_MUYASSAR_ID}?verse_key=${reference}`);
      const text = data?.tafsirs?.[0]?.text?.replace(/<[^>]+>/g, "").trim();
      if (!text) return null;

      return {
        id: `tafsir-${reference}`,
        provider: "tafsir",
        kind: "tafsir",
        text,
        source: `التفسير الميسر ${reference}`,
        stateTags: [request.state],
        weight: 9,
        isShareable: true,
        isOfflineReady: false,
        meta: { reference },
      };
    } catch {
      return null;
    }
  },
};
