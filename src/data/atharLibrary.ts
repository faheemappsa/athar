export type AtharKind = "ayah" | "hadith" | "dua" | "wisdom";
export type AtharTime = "morning" | "pressure" | "night" | "any";
export type AtharTag =
  | "tawakkul"
  | "barakah"
  | "sabr"
  | "sakinah"
  | "rahmah"
  | "raja"
  | "shukr"
  | "focus"
  | "yusr"
  | "hidayah"
  | "rizq"
  | "thabat";

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
    tags: ["sabr", "raja", "yusr"],
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
    id: "ayah-006",
    kind: "ayah",
    text: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ",
    source: "النحل: 127",
    times: ["pressure", "any"],
    tags: ["sabr", "tawakkul"],
  },
  {
    id: "ayah-007",
    kind: "ayah",
    text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    source: "البقرة: 153",
    times: ["pressure", "any"],
    tags: ["sabr", "thabat"],
  },
  {
    id: "ayah-008",
    kind: "ayah",
    text: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
    source: "الأعراف: 156",
    times: ["night", "any"],
    tags: ["rahmah", "raja"],
  },
  {
    id: "ayah-009",
    kind: "ayah",
    text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    source: "آل عمران: 173",
    times: ["morning", "pressure", "any"],
    tags: ["tawakkul", "thabat"],
  },
  {
    id: "ayah-010",
    kind: "ayah",
    text: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ",
    source: "البقرة: 216",
    times: ["night", "pressure", "any"],
    tags: ["raja", "sakinah"],
  },
  {
    id: "ayah-011",
    kind: "ayah",
    text: "إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ",
    source: "يوسف: 100",
    times: ["night", "any"],
    tags: ["rahmah", "sakinah"],
  },
  {
    id: "ayah-012",
    kind: "ayah",
    text: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    source: "طه: 114",
    times: ["morning", "any"],
    tags: ["hidayah", "focus", "barakah"],
  },
  {
    id: "ayah-013",
    kind: "ayah",
    text: "رَبِّ اشْرَحْ لِي صَدْرِي",
    source: "طه: 25",
    times: ["morning", "pressure", "any"],
    tags: ["sakinah", "yusr"],
  },
  {
    id: "ayah-014",
    kind: "ayah",
    text: "وَيَسِّرْ لِي أَمْرِي",
    source: "طه: 26",
    times: ["morning", "pressure", "any"],
    tags: ["yusr", "barakah"],
  },
  {
    id: "ayah-015",
    kind: "ayah",
    text: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    source: "القصص: 24",
    times: ["morning", "night", "any"],
    tags: ["rizq", "tawakkul"],
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
    id: "hadith-003",
    kind: "hadith",
    text: "أحب الأعمال إلى الله أدومها وإن قل",
    source: "متفق عليه",
    times: ["morning", "any"],
    tags: ["thabat", "barakah"],
  },
  {
    id: "hadith-004",
    kind: "hadith",
    text: "تبسمك في وجه أخيك صدقة",
    source: "رواه الترمذي",
    times: ["morning", "any"],
    tags: ["rahmah", "barakah"],
  },
  {
    id: "hadith-005",
    kind: "hadith",
    text: "من دل على خير فله مثل أجر فاعله",
    source: "رواه مسلم",
    times: ["any"],
    tags: ["barakah", "shukr"],
  },
  {
    id: "hadith-006",
    kind: "hadith",
    text: "الكلمة الطيبة صدقة",
    source: "متفق عليه",
    times: ["morning", "any"],
    tags: ["rahmah", "barakah"],
  },
  {
    id: "dua-001",
    kind: "dua",
    text: "اللهم إني أسألك قلباً مطمئناً، وعملاً متقبلاً، ورزقاً طيباً",
    source: "دعاء",
    times: ["morning", "any"],
    tags: ["sakinah", "barakah", "rizq"],
  },
  {
    id: "dua-002",
    kind: "dua",
    text: "اللهم يسّر لي أمري، واشرح صدري، وبارك لي في يومي",
    source: "دعاء",
    times: ["morning", "pressure", "any"],
    tags: ["barakah", "tawakkul", "yusr"],
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
    id: "dua-004",
    kind: "dua",
    text: "اللهم اجعل بداية يومي بركة، ووسطه توفيقاً، وآخره رضا",
    source: "دعاء",
    times: ["morning", "any"],
    tags: ["barakah", "shukr"],
  },
  {
    id: "dua-005",
    kind: "dua",
    text: "اللهم لا تجعل في قلبي ضيقاً إلا فرجته، ولا هماً إلا أذهبته",
    source: "دعاء",
    times: ["pressure", "night", "any"],
    tags: ["sakinah", "raja", "yusr"],
  },
  {
    id: "dua-006",
    kind: "dua",
    text: "اللهم ارزقني سكينة القلب، وصفاء النية، وحسن التوكل عليك",
    source: "دعاء",
    times: ["night", "pressure", "any"],
    tags: ["sakinah", "tawakkul"],
  },
  {
    id: "dua-007",
    kind: "dua",
    text: "اللهم افتح لي أبواب رحمتك، واهدني لأحب الأعمال إليك",
    source: "دعاء",
    times: ["morning", "any"],
    tags: ["rahmah", "hidayah"],
  },
  {
    id: "dua-008",
    kind: "dua",
    text: "اللهم إن ضاقت عليّ الأرض بما رحبت، فوسّع عليّ بلطفك",
    source: "دعاء",
    times: ["night", "pressure", "any"],
    tags: ["rahmah", "sakinah", "raja"],
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
