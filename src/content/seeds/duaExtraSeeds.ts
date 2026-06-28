import type { AtharProviderContent } from "../types";

export const DUA_EXTRA_SEEDS: AtharProviderContent[] = [
  {
    id: "dua-raja-1",
    provider: "dua",
    kind: "dua",
    text: "رب إني مسني الضر وأنت أرحم الراحمين.",
    source: "الأنبياء: 83",
    stateTags: ["raja", "rahmah"],
    weight: 9,
    isShareable: true,
    isOfflineReady: true,
  },
  {
    id: "dua-barakah-1",
    provider: "dua",
    kind: "dua",
    text: "رب أنزلني منزلًا مباركًا وأنت خير المنزلين.",
    source: "المؤمنون: 29",
    stateTags: ["barakah", "sakinah"],
    weight: 8,
    isShareable: true,
    isOfflineReady: true,
  },
];
