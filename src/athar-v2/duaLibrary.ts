import type { AtharV2Item } from "./types";

export const ATHAR_V2_DUA_LIBRARY: AtharV2Item[] = [
  {
    id: "dua-allahumma-inni-asalukal-afiyah",
    type: "dua",
    text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة",
    source: { title: "سنن أبي داود وابن ماجه", reference: "من أذكار الصباح والمساء", verifier: "صحيح" },
    tags: ["mercy", "morning", "evening", "short"],
    occasions: ["daily_morning", "daily_evening", "generic"],
    priority: 87,
    weight: 7,
  },
];
