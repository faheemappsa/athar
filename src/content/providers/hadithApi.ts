import type { AtharContentRequest, AtharProviderContent } from "../types";

const API_BASE = "https://api.hadith.gading.dev/books";
const HADITH_TIMEOUT_MS = 7000;
const SHORT_HADITH_MAX_LENGTH = 220;

type OpenHadithItem = {
  number?: number | string;
  arab?: string;
};

type OpenHadithResponse = {
  data?: {
    hadiths?: OpenHadithItem[];
  };
};

const OPEN_BOOKS = [
  { id: "bukhari", label: "صحيح البخاري" },
  { id: "muslim", label: "صحيح مسلم" },
  { id: "tirmidzi", label: "جامع الترمذي" },
  { id: "nasai", label: "سنن النسائي" },
  { id: "abu-daud", label: "سنن أبي داود" },
] as const;

const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HADITH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return response.json() as Promise<OpenHadithResponse>;
  } finally {
    clearTimeout(timeout);
  }
};

const cleanHadithText = (text: string) => text.replace(/\s+/g, " ").trim();

const isShortHadith = (text: string) => {
  const clean = cleanHadithText(text);
  return clean.length >= 28 && clean.length <= SHORT_HADITH_MAX_LENGTH;
};

const pickBook = () => OPEN_BOOKS[Math.floor(Math.random() * OPEN_BOOKS.length)] || OPEN_BOOKS[0];

export const fetchHadithContent = async (request: AtharContentRequest): Promise<AtharProviderContent | null> => {
  if (request.allowNetwork === false) return null;

  try {
    const book = pickBook();
    const data = await fetchWithTimeout(`${API_BASE}/${book.id}?range=1-120`);
    const items = data?.data?.hadiths || [];
    const item = items.find((hadith) => {
      const id = `hadith-open-${book.id}-${hadith.number || "unknown"}`;
      return hadith.arab && isShortHadith(hadith.arab) && !request.avoidContentIds.includes(id);
    });

    if (!item?.arab) return null;

    const hadithId = `hadith-open-${book.id}-${item.number || Date.now()}`;

    return {
      id: hadithId,
      provider: "hadith",
      kind: "hadith",
      text: cleanHadithText(item.arab),
      source: `${book.label}${item.number ? `: ${item.number}` : ""}`,
      stateTags: [request.state],
      weight: 7,
      isShareable: true,
      isOfflineReady: false,
    };
  } catch {
    return null;
  }
};
