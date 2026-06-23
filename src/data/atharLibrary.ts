export type AtharKind = "ayah" | "hadith" | "dua" | "wisdom";
export type AtharTime = "morning" | "pressure" | "night" | "any";
export type AtharTag = "tawakkul" | "barakah" | "sabr" | "sakinah" | "rahmah" | "raja" | "shukr" | "focus";

export type AtharItem = {
  id: string;
  kind: AtharKind;
  text: string;
  source: string;
  times: AtharTime[];
  tags: AtharTag[];
};

export const ATHAR_LIBRARY: AtharItem[] = [
  {
    id: "ayah-001",
    kind: "ayah",
    text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    source: "الرعد: 28",
    times: ["pressure", "night", "any"],
    tags: ["sakinah", "raja"],
  },
  {
    id: "ayah-002",
    kind: "ayah",
    text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    source: "الطلاق: 3",
    times: ["morning", "any"],
    tags: ["tawakkul", "barakah"],
  },
  {
    id: "ayah-003",
    kind: "ayah",
    text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    source: "الشرح: 5",
    times: ["pressure", "night", "any"],
    tags: ["sabr", "raja"],
  },
  {
    id: "ayah-004",
    kind: "ayah",
    text: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ",
    source: "الأعراف: 56",
    times: ["night", "any"],
    tags: ["rahmah", "raja"],
  },
  {
    id: "ayah-005",
    kind: "ayah",
    text: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    source: "إبراهيم: 7",
    times: ["morning", "any"],
    tags: ["shukr", "barakah"],
  },
  {
    id: "hadith-001",
    kind: "hadith",
    text: "احرص على ما ينفعك، واستعن بالله ولا تعجز",
    source: "رواه مسلم",
    times: ["morning", "pressure", "any"],
    tags: ["focus", "tawakkul"],
  },
  {
    id: "hadith-002",
    kind: "hadith",
    text: "عجباً لأمر المؤمن، إن أمره كله خير",
    source: "رواه مسلم",
    times: ["pressure", "night", "any"],
    tags: ["sabr", "raja"],
  },
  {
    id: "dua-001",
    kind: "dua",
    text: "اللهم إني أسألك قلباً مطمئناً، وعملاً متقبلاً، ورزقاً طيباً",
    source: "دعاء",
    times: ["morning", "any"],
    tags: ["sakinah", "barakah"],
  },
  {
    id: "dua-002",
    kind: "dua",
    text: "اللهم يسّر لي أمري، واشرح صدري، وبارك لي في يومي",
    source: "دعاء",
    times: ["morning", "pressure", "any"],
    tags: ["barakah", "tawakkul"],
  },
  {
    id: "dua-003",
    kind: "dua",
    text: "اللهم اجبر خاطري جبراً يليق بكرمك ولطفك",
    source: "دعاء",
    times: ["night", "any"],
    tags: ["rahmah", "raja"],
  },
  {
    id: "wisdom-001",
    kind: "wisdom",
    text: "من عرف الله هانت عليه تقلبات الأيام",
    source: "مأثور",
    times: ["night", "pressure", "any"],
    tags: ["sakinah", "raja"],
  },
  {
    id: "wisdom-002",
    kind: "wisdom",
    text: "ليس الهدوء فراغاً من الهم، بل امتلاء القلب بالثقة بالله",
    source: "حكمة",
    times: ["pressure", "night", "any"],
    tags: ["sakinah", "tawakkul"],
  },
];
