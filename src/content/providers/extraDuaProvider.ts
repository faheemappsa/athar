import type { AtharContentProvider } from "../types";
import { DUA_EXTRA_SEEDS } from "../seeds/duaExtraSeeds";

export const extraDuaProvider: AtharContentProvider = {
  id: "dua",
  async getContent(request) {
    if (!request.preferredKinds.includes("dua")) return null;

    const selected = DUA_EXTRA_SEEDS.find((item) => item.stateTags.includes(request.state) && !request.avoidContentIds.includes(item.id));
    return selected || DUA_EXTRA_SEEDS.find((item) => !request.avoidContentIds.includes(item.id)) || null;
  },
};
