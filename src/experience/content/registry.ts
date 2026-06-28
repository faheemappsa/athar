import type { ContentProvider } from "./provider";
import { fetchQuranContent } from "./quranApiProvider";
import { getTafsirContent } from "./tafsirProvider";

export const EXPERIENCE_CONTENT_PROVIDERS: ContentProvider[] = [
  {
    id: "quran-api",
    priority: 10,
    get: fetchQuranContent,
  },
  {
    id: "tafsir-api",
    priority: 8,
    get: getTafsirContent,
  },
];
