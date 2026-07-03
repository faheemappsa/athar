import type { AtharV2Item } from "./types";

export const ATHAR_V2_AYAH_LIBRARY: AtharV2Item[] = [
  {
    id: "ayah-al-fatiha-5",
    type: "ayah",
    text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    source: { title: "القرآن الكريم", reference: "الفاتحة: 5" },
    tags: ["tawhid", "tawakkul", "short"],
    occasions: ["daily_morning", "daily_evening", "generic"],
    priority: 84,
    weight: 7,
  },
  {
    id: "ayah-ash-sharh-5-6",
    type: "ayah",
    text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    source: { title: "القرآن الكريم", reference: "الشرح: 5-6" },
    tags: ["hope", "mercy", "short"],
    occasions: ["daily_evening", "generic"],
    priority: 78,
    weight: 6,
  },
];
