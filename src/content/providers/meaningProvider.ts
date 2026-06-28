import type { AtharContentProvider } from "../types";
import { MEANING_SEEDS } from "../seeds/meaningSeeds";

export const meaningProvider: AtharContentProvider = {
  id: "meaning",
  async getContent(request) {
    if (!request.preferredKinds.includes("wisdom") && !request.preferredKinds.includes("tafsir")) return null;

    const selected = MEANING_SEEDS.find((item) => {
      return item.stateTags.includes(request.state) && !request.avoidContentIds.includes(item.id);
    });

    return selected || MEANING_SEEDS.find((item) => !request.avoidContentIds.includes(item.id)) || MEANING_SEEDS[0] || null;
  },
};
