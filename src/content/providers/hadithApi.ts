import type { AtharContentRequest, AtharProviderContent } from "../types";

const API_BASE = "https://hadithapi.com/api";

const getApiKey = () => {
  try {
    return import.meta.env.VITE_HADITH_API_KEY as string | undefined;
  } catch {
    return undefined;
  }
};

export const fetchHadithContent = async (request: AtharContentRequest): Promise<AtharProviderContent | null> => {
  const apiKey = getApiKey();
  if (!apiKey || request.allowNetwork === false) return null;

  const response = await fetch(`${API_BASE}/hadiths?apiKey=${apiKey}&status=Sahih&paginate=10`);
  const data = await response.json();
  const item = data?.hadiths?.data?.find((hadith: { hadithArabic?: string; hadithNumber?: string }) => {
    return hadith.hadithArabic && !request.avoidContentIds.includes(`hadith-api-${hadith.hadithNumber}`);
  });

  if (!item?.hadithArabic) return null;

  return {
    id: `hadith-api-${item.hadithNumber || Date.now()}`,
    provider: "hadith",
    kind: "hadith",
    text: item.hadithArabic,
    source: item.bookSlug || "Hadith API",
    stateTags: [request.state],
    weight: 7,
    isShareable: true,
    isOfflineReady: false,
  };
};
