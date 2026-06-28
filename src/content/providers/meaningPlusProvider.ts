import type { AtharContentProvider } from "../types";
import { MEANING_MORE_SEEDS } from "../seeds/meaningMoreSeeds";

export const meaningPlusProvider: AtharContentProvider = {
  id: "meaning",
  async getContent(request) {
    if (!request.preferredKinds.includes("wisdom") && !request.preferredKinds.includes("tafsir")) return null;
    return MEANING_MORE_SEEDS.find((item) => item.stateTags.includes(request.state) && !request.avoidContentIds.includes(item.id)) || null;
  },
};
