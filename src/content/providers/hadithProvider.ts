import type { AtharContentProvider } from "../types";
import { HADITH_SEEDS } from "../seeds/hadithSeeds";
import { fetchHadithContent } from "./hadithApi";

export const hadithProvider: AtharContentProvider = {
  id: "hadith",
  async getContent(request) {
    if (!request.preferredKinds.includes("hadith")) return null;

    const apiContent = await fetchHadithContent(request);
    if (apiContent) return apiContent;

    const selected = HADITH_SEEDS.find((item) => {
      return item.stateTags.includes(request.state) && !request.avoidContentIds.includes(item.id);
    });

    return selected || HADITH_SEEDS.find((item) => !request.avoidContentIds.includes(item.id)) || HADITH_SEEDS[0] || null;
  },
};
