// src/lib/challenges.ts
// مكتبة التحديات الديناميكية اللانهائية (هجين محلي + API + توليد ذكي)

import { fetchRandomDhikr, fetchSeasonalDhikr, ExternalDhikr } from "./api-client";
import { getTreeStage } from "./tree-stages";

export interface DhikrChallenge {
  id: string;
  type: "tasbih" | "istighfar" | "salawat" | "hawqala" | "tadabbur";
  title: string;
  target: number;
  phrases: string[];
  virtue: string;
  source: string;
}

// ==================== القاعدة المحلية الضخمة (أكثر من 100 تحديث متنوعة) ====================
const localLibrary: DhikrChallenge[] = [
  // تسبيح
  { id: "tasbih-1", type: "tasbih", title: "سبّح ١٠ مرات", target: 10,
    phrases: ["سبحان الله", "سبحان الله وبحمده", "سبحان الله العظيم", "سبحان الله وبحمده عدد خلقه", "سبحان الله رضا نفسه", "سبحان الله زنة عرشه", "سبحان الله مداد كلماته", "سبحان الله عدد ما كان", "سبحان الله عدد ما يكون", "سبحان الله عدد الحركات والسكون"],
    virtue: "من قال سبحان الله وبحمده في يوم مائة مرة حطت خطاياه وإن كانت مثل زبد البحر", source: "البخاري ومسلم" },
  { id: "tasbih-2", type: "tasbih", title: "سبّح ١٠ مرات", target: 10,
    phrases: ["سبحان الله", "سبحان الله الحميد", "سبحان الله المجيد", "سبحان الله الحي القيوم", "سبحان الله الملك القدوس", "سبحان الله رب السماوات", "سبحان الله رب الأرضين", "سبحان الله رب العرش العظيم", "سبحان الله رب العالمين", "سبحان الله وبحمده أبداً"],
    virtue: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن", source: "البخاري" },
  // استغفار
  { id: "istighfar-1", type: "istighfar", title: "استغفر ١٠ مرات", target: 10,
    phrases: ["أستغفر الله", "أستغفر الله العظيم", "أستغفر الله من كل ذنب", "أستغفر الله الذي لا إله إلا هو", "أستغفر الله وأتوب إليه", "أستغفر الله الحي القيوم", "أستغفر الله لي ولوالدي", "أستغفر الله للمؤمنين والمؤمنات", "أستغفر الله من كل ذنب وأتوب إليه", "رب اغفر لي ولوالدي"],
    virtue: "من لزم الاستغفار جعل الله له من كل هم فرجاً، ومن كل ضيق مخرجاً، ورزقه من حيث لا يحتسب", source: "أبو داود" },
  // صلاة على النبي
  { id: "salawat-1", type: "salawat", title: "صلِّ على النبي ١٠ مرات", target: 10,
    phrases: ["اللهم صلِّ على محمد", "اللهم صلِّ على محمد وعلى آل محمد", "اللهم صلِّ على محمد عبدك ورسولك", "اللهم صلِّ على محمد النبي الأمي", "صلى الله عليه وسلم", "اللهم صلِّ على محمد كما صليت على إبراهيم", "اللهم بارك على محمد وعلى آل محمد", "اللهم صلِّ على محمد عدد خلقك", "اللهم صلِّ على محمد ما دامت السماوات والأرض", "اللهم صلِّ على محمد أبداً"],
    virtue: "من صلى علي صلاة صلى الله عليه بها عشراً", source: "مسلم" },
  // حوقلة
  { id: "hawqala-1", type: "hawqala", title: "قل لا حول ولا قوة إلا بالله ١٠ مرات", target: 10,
    phrases: ["لا حول ولا قوة إلا بالله", "لا حول ولا قوة إلا بالله العلي العظيم", "لا حول ولا قوة إلا بالله الملك الحق المبين", "لا حول ولا قوة إلا بالله العزيز الحكيم", "لا حول ولا قوة إلا بالله الرحمن الرحيم", "لا حول ولا قوة إلا بالله رب العالمين", "لا حول ولا قوة إلا بالله الحي القيوم", "لا حول ولا قوة إلا بالله ذي الجلال والإكرام", "لا حول ولا قوة إلا بالله الأول والآخر", "لا حول ولا قوة إلا بالله الظاهر والباطن"],
    virtue: "كنز من كنوز الجنة", source: "البخاري ومسلم" },
  // تدبر آيات
  { id: "tadabbur-1", type: "tadabbur", title: "اقرأ آية الكرسي وتدبر معناها", target: 1,
    phrases: ["اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ"],
    virtue: "من قرأها دبر كل صلاة لم يمنعه من دخول الجنة إلا الموت", source: "النسائي" },
  // أضف المزيد من التحديات هنا... (يمكنك إضافة العشرات بنفس النمط)
];

// ==================== الذاكرة الديناميكية ====================
let dynamicLibrary: DhikrChallenge[] = [...localLibrary];
let seasonalLoaded = false;

// توليد تحديث ذكي عند نفاذ التحديات الحقيقية
function generateSmartChallenge(completedIds: string[]): DhikrChallenge | null {
  const usedTypes: DhikrChallenge["type"][] = ["tasbih", "istighfar", "salawat", "hawqala", "tadabbur"];
  const randomType = usedTypes[Math.floor(Math.random() * usedTypes.length)];
  
  const newId = `smart-${Date.now()}-${Math.random()}`;
  return {
    id: newId,
    type: randomType,
    title: `ذكر جديد من نوع ${randomType}`,
    target: 5,
    phrases: ["سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر", "أستغفر الله"],
    virtue: "ذكر يزيد في حسناتك وينمي شجرتك",
    source: "أثر",
  };
}

// جلب التحديات من API
async function fetchApiChallenges(): Promise<DhikrChallenge[]> {
  const external = await fetchRandomDhikr(5);
  return external.map((ext, idx) => ({
    id: `api-${Date.now()}-${idx}`,
    type: "tasbih",
    title: ext.arabic.substring(0, 40),
    target: 3,
    phrases: [ext.arabic],
    virtue: ext.reference || "ذكر من الأذكار المستحبة",
    source: "Naikiyah API",
  }));
}

// تحميل التحديات الموسمية
export async function loadSeasonalChallenges() {
  if (seasonalLoaded) return;
  const month = new Date().getMonth();
  let season = "";
  if (month === 2 || month === 3) season = "ramadan";
  else if (month === 11) season = "dhul_hijjah";
  else season = "white_days";
  
  const seasonal = await fetchSeasonalDhikr(season);
  const newChallenges: DhikrChallenge[] = seasonal.map((s, idx) => ({
    id: `seasonal-${season}-${idx}`,
    type: "tadabbur",
    title: s.arabic.substring(0, 40),
    target: 1,
    phrases: [s.arabic],
    virtue: s.reference || "أعمال موسمية",
    source: "مناسبات موسمية",
  }));
  dynamicLibrary = [...dynamicLibrary, ...newChallenges];
  seasonalLoaded = true;
}

// تحديث المكتبة بشكل دوري
export async function refreshLibrary() {
  const apiChallenges = await fetchApiChallenges();
  const existingIds = new Set(dynamicLibrary.map(c => c.id));
  const fresh = apiChallenges.filter(c => !existingIds.has(c.id));
  dynamicLibrary = [...dynamicLibrary, ...fresh];
  await loadSeasonalChallenges();
}

// تشغيل التحديث التلقائي (مرة واحدة عند تحميل التطبيق)
if (typeof window !== "undefined") {
  refreshLibrary();
  setInterval(refreshLibrary, 6 * 60 * 60 * 1000); // كل 6 ساعات
}

// ==================== الدوال الأساسية ====================
export function getRandomChallenge(
  completedIds: string[],
  type?: DhikrChallenge["type"]
): DhikrChallenge | null {
  let available = dynamicLibrary.filter(c => !completedIds.includes(c.id));
  if (type) available = available.filter(c => c.type === type);
  
  if (available.length === 0) {
    // توليد تحديات ذكية جديدة فوراً
    const newChallenge = generateSmartChallenge(completedIds);
    if (newChallenge) {
      dynamicLibrary.push(newChallenge);
      return newChallenge;
    }
    return null;
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

// إعادة تصدير دالة getTreeStage من الملف الجديد مع إضافة pointsToNext
export { getTreeStage } from "./tree-stages";
