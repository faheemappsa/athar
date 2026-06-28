import type { AtharContentProvider } from "../types";
import { DUA_SEEDS } from "../seeds/duaSeeds";

export const duaProvider: AtharContentProvider = {
  id: "dua",
  async getContent(request) {
    if (!request.preferredKinds.includes("dua")) return null;

    const candidates = DUA_SEEDS.filter((item) => {
      return item.stateTags.includes(request.state) && !request.avoidContentIds.includes(item.id);
    });

    const fallback = DUA_SEEDS.filter((item) => !request.avoidContentIds.includes(item.id));
    const pool = candidates.length ? candidates : fallback;
    const selected = pool[Math.floor(Math.random() * pool.length)] || DUA_SEEDS[0];

    return selected || null;
  },
};
