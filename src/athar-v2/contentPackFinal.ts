import type { AtharV2Item } from "./types";

export const ATHAR_V2_CONTENT_PACK_FINAL: AtharV2Item[] = [
  {
    id: "final-ayah-yunus-58",
    type: "ayah",
    text: "قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا",
    source: { title: "القرآن الكريم", reference: "يونس: 58" },
    tags: ["mercy", "hope", "short"],
    occasions: ["daily_morning", "generic"],
    priority: 82,
    weight: 7
  },
  {
    id: "final-ayah-al-imran-173",
    type: "ayah",
    text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    source: { title: "القرآن الكريم", reference: "آل عمران: 173" },
    tags: ["tawakkul", "hope", "short"],
    occasions: ["daily_morning", "daily_evening", "generic"],
    priority: 88,
    weight: 8
  },
  {
    id: "final-dua-rabbi-zidni-ilma",
    type: "dua",
    text: "رَبِّ زِدْنِي عِلْمًا",
    source: { title: "القرآن الكريم", reference: "طه: 114" },
    tags: ["dua", "barakah", "morning", "short"],
    occasions: ["daily_morning", "generic"],
    priority: 80,
    weight: 6
  },
  {
    id: "final-dua-rabbana-taqabbal",
    type: "dua",
    text: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ",
    source: { title: "القرآن الكريم", reference: "البقرة: 127" },
    tags: ["dua", "hope", "short"],
    occasions: ["ramadan", "arafah", "generic"],
    priority: 86,
    weight: 7
  },
  {
    id: "final-hadith-din-nasiha",
    type: "hadith",
    text: "الدِّينُ النَّصِيحَةُ",
    source: { title: "صحيح مسلم", reference: "حديث تميم الداري رضي الله عنه" },
    tags: ["barakah", "short"],
    occasions: ["daily_morning", "generic"],
    priority: 74,
    weight: 5
  },
  {
    id: "final-hadith-la-darar",
    type: "hadith",
    text: "لا ضَرَرَ ولا ضِرارَ",
    source: { title: "سنن ابن ماجه والموطأ", reference: "قاعدة نبوية جامعة", verifier: "صحيح بمجموع طرقه" },
    tags: ["barakah", "short"],
    occasions: ["daily_evening", "generic"],
    priority: 72,
    weight: 5
  },
  {
    id: "final-tafsir-yunus-58",
    type: "tafsir",
    text: "الفرح الحقيقي يكون بفضل الله ورحمته، لا بزينة الدنيا الزائلة.",
    source: { title: "التفسير الميسر والسعدي", reference: "معنى يونس: 58" },
    tags: ["quran_meaning", "mercy", "hope", "short"],
    occasions: ["daily_morning", "generic"],
    priority: 76,
    weight: 5
  },
  {
    id: "final-tafsir-imran-173",
    type: "tafsir",
    text: "كفاية الله لعبده أعظم ما يطمئن به القلب عند الخوف والحاجة.",
    source: { title: "تفسير السعدي", reference: "معنى آل عمران: 173" },
    tags: ["quran_meaning", "tawakkul", "hope", "short"],
    occasions: ["daily_morning", "daily_evening", "generic"],
    priority: 78,
    weight: 6
  }
];
