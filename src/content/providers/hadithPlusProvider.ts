import type { AtharContentProvider } from "../types";
import { HADITH_EXTRA_SEEDS } from "../seeds/hadithExtraSeeds";

export const hadithPlusProvider: AtharContentProvider = {
  id: "hadith",
  async getContent(request) {
    if (!request.preferredKinds.includes("hadith")) return null;
    return HADITH_EXTRA_SEEDS.find((item) => item.stateTags.includes(request.state) && !request.avoidContentIds.includes(item.id)) || null;
  },
};
