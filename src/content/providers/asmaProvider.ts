import type { AtharContentProvider } from "../types";
import { ASMA_SEEDS } from "../seeds/asmaSeeds";

export const asmaProvider: AtharContentProvider = {
  id: "asma",
  async getContent(request) {
    if (!request.preferredKinds.includes("asma")) return null;

    const selected = ASMA_SEEDS.find((item) => {
      return item.stateTags.includes(request.state) && !request.avoidContentIds.includes(item.id);
    });

    return selected || ASMA_SEEDS.find((item) => !request.avoidContentIds.includes(item.id)) || ASMA_SEEDS[0] || null;
  },
};
