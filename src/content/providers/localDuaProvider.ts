import type { AtharContentProvider } from "../types";
import { DUA_SEEDS } from "../seeds/duaSeeds";

export const localDuaProvider: AtharContentProvider = {
  id: "dua",
  async getContent(request) {
    if (!request.preferredKinds.includes("dua")) return null;

    const selected = DUA_SEEDS.find((item) => {
      return item.stateTags.includes(request.state) && !request.avoidContentIds.includes(item.id);
    });

    return selected || DUA_SEEDS.find((item) => !request.avoidContentIds.includes(item.id)) || DUA_SEEDS[0] || null;
  },
};
