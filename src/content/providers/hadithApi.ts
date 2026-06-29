import type { AtharContentRequest, AtharProviderContent } from "../types";

const API_BASE = "https://hadithapi.com/api";
const HADITH_TIMEOUT_MS = 7000;

type HadithApiItem = {
  hadithArabic?: string;
  hadithNumber?: string | number;
  bookSlug?: string;
};

const getApiKey = () => {
  try {
    return import.meta.env.VITE_HADITH_API_KEY as string | undefined;
  } catch {
    return undefined;
  }
};

const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HADITH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

export const fetchHadithContent = async (request: AtharContentRequest): Promise<AtharProviderContent | null> => {
  const apiKey = getApiKey();
  if (!apiKey || request.allowNetwork === false) return null;

  try {
    const url = `${API_BASE}/hadiths?apiKey=${apiKey}&status=Sahih&paginate=25`;
    const data = await fetchWithTimeout(url);
    const items = (data?.hadiths?.data || []) as HadithApiItem[];
    const item = items.find((hadith) => {
      const id = `hadith-api-${hadith.hadithNumber || hadith.bookSlug || "unknown"}`;
      return hadith.hadithArabic && !request.avoidContentIds.includes(id);
    });

    if (!item?.hadithArabic) return null;

    const hadithId = `hadith-api-${item.hadithNumber || item.bookSlug || Date.now()}`;

    return {
      id: hadithId,
      provider: "hadith",
      kind: "hadith",
      text: item.hadithArabic,
      source: item.bookSlug ? `Hadith API - ${item.bookSlug}` : "Hadith API",
      stateTags: [request.state],
      weight: 7,
      isShareable: true,
      isOfflineReady: false,
    };
  } catch {
    return null;
  }
};
