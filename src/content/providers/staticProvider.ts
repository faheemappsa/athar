import { ATHAR_LIBRARY } from "../../data/atharLibrary";
import type { AtharContentProvider, AtharProviderContent } from "../types";

const KIND_MAP: Record<string, AtharProviderContent["kind"]> = {
  ayah: "ayah",
  hadith: "hadith",
  dua: "dua",
  wisdom: "wisdom",
};

export const staticProvider: AtharContentProvider = {
  id: "local",
  async getContent(request) {
    const candidates = ATHAR_LIBRARY.filter((item) => {
      const kind = KIND_MAP[item.kind];
      return kind && request.preferredKinds.includes(kind) && !request.avoidContentIds.includes(item.id);
    });

    const fallback = ATHAR_LIBRARY.filter((item) => !request.avoidContentIds.includes(item.id));
    const pool = candidates.length ? candidates : fallback;
    const selected = pool[Math.floor(Math.random() * pool.length)] || ATHAR_LIBRARY[0];
    if (!selected) return null;

    return {
      id: selected.id,
      provider: "local",
      kind: KIND_MAP[selected.kind] || "wisdom",
      text: selected.text,
      source: selected.source,
      stateTags: [request.state],
      weight: 6,
      isShareable: true,
      isOfflineReady: true,
      meta: { originalKind: selected.kind },
    };
  },
};
