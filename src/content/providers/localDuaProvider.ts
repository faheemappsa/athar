import type { AtharContentProvider } from "../types";
import { DUA_SEEDS } from "../seeds/duaSeeds";

export const localDuaProvider: AtharContentProvider = {
  id: "dua",
  async getContent(request) {
    if (!request.preferredKinds.includes("dua")) return null;
    return DUA_SEEDS[0] || null;
  },
};
