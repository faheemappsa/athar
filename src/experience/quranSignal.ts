import { recordAtharBehavior } from "./memory";

export const recordQuranSignal = (eventName: string, page: number, surahName: string) => {
  recordAtharBehavior({
    type: "surface_click",
    surface: "quran-page",
    contentId: `quran-${page}`,
    metadata: { eventName, page, surahName },
  } as Parameters<typeof recordAtharBehavior>[0]);
};
