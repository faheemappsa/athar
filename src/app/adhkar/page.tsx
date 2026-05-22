"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, RefreshCw, BookOpen, Sun, Moon, BedDouble } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface DhikrItem {
  text: string;
  category: "صباح" | "مساء" | "نوم";
  reference: string;
  count?: string; // عدد التكرار
  virtue?: string; // فضل الذكر
}

// قاعدة بيانات موسعة للأذكار المأثورة
const fullAdhkar: Record<string, DhikrItem[]> = {
  morning: [
    { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", category: "صباح", reference: "مسلم", count: "مرة واحدة", virtue: "من قالها حين يصبح... حفظ من كل شيطان" },
    { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", category: "صباح", reference: "الترمذي", count: "مرة واحدة", virtue: "تذكير بالتبعية لله" },
    { text: "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ", category: "صباح", reference: "البخاري", count: "مرة واحدة", virtue: "سيّد الاستغفار، من قالها موقناً فمات دخل الجنة" },
    { text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا", category: "صباح", reference: "أبو داود", count: "٣ مرات", virtue: "وجبت له الجنة" },
    { text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", category: "صباح", reference: "الترمذي", count: "٣ مرات", virtue: "لم يضره شيء" },
    { text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ", category: "صباح", reference: "أبو داود", count: "٣ مرات", virtue: "دعاء بالعافية" },
    { text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", category: "صباح", reference: "الترمذي", count: "٧ مرات", virtue: "كفاه الله ما أهمه" },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", category: "صباح", reference: "مسلم", count: "٣ مرات", virtue: "أجر عظيم" },
    { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً", category: "صباح", reference: "ابن ماجه", count: "مرة واحدة", virtue: "دعاء شامل" },
  ],
  evening: [
    { text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ", category: "مساء", reference: "مسلم", count: "مرة واحدة" },
    { text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", category: "مساء", reference: "الترمذي", count: "مرة واحدة" },
    { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", category: "مساء", reference: "مسلم", count: "٣ مرات", virtue: "لم يضره شيء" },
    { text: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ، وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ", category: "مساء", reference: "أبو داود", count: "مرة واحدة", virtue: "من قالها أعتق ربعه من النار" },
    { text: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ", category: "مساء", reference: "أبو داود", count: "مرة واحدة", virtue: "أدى شكر يومه" },
    { text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا", category: "مساء", reference: "أبو داود", count: "٣ مرات", virtue: "وجبت له الجنة" },
    { text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", category: "مساء", reference: "الترمذي", count: "٣ مرات" },
    { text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", category: "مساء", reference: "الترمذي", count: "٧ مرات" },
  ],
  sleep: [
    { text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", category: "نوم", reference: "البخاري", count: "مرة واحدة" },
    { text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", category: "نوم", reference: "أبو داود", count: "٣ مرات" },
    { text: "سُبْحَانَكَ اللَّهُمَّ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ", category: "نوم", reference: "البخاري", count: "مرة واحدة" },
    { text: "اللَّهُمَّ إِنِّي أَسْلَمْتُ وَجْهِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، اللَّهُمَّ آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ", category: "نوم", reference: "البخاري", count: "مرة واحدة" },
    { text: "قُلْ هُوَ اللَّهُ أَحَدٌ، وَالْمُعَوِّذَتَيْنِ (الإخلاص والفلق والناس)", category: "نوم", reference: "البخاري", count: "٣ مرات", virtue: "تكفيه من كل شيء" },
    { text: "آمَنَ الرَّسُولُ... (آخر آيتين من سورة البقرة)", category: "نوم", reference: "البخاري", count: "مرة واحدة", virtue: "من قرأهما في ليلة كفتاه" },
    { text: "اللَّهُمَّ أَنْتَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ", category: "نوم", reference: "مسلم", count: "مرة واحدة" },
  ],
};

export default function AdhkarPage() {
  const [activeCategory, setActiveCategory] = useState<"morning" | "evening" | "sleep">("morning");
  const [adhkar, setAdhkar] = useState<DhikrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadAdhkar = async (category: "morning" | "evening" | "sleep") => {
    setLoading(true);
    setError(false);
    try {
      // محاكاة جلب من API مع تأخير بسيط للإحساس بالتحميل
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = fullAdhkar[category] || [];
      setAdhkar(data);
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAdhkar(activeCategory);
  }, [activeCategory]);

  const categories = [
    { key: "morning" as const, label: "أذكار الصباح", icon: Sun },
    { key: "evening" as const, label: "أذكار المساء", icon: Moon },
    { key: "sleep" as const, label: "أذكار النوم", icon: BedDouble },
  ];

  return (
    <main className="min-h-screen pb-28 bg-athar-bg">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-athar-primary" />
          <h1 className="text-2xl font-bold text-athar-primary">الأذكار</h1>
        </div>
        <button
          onClick={() => loadAdhkar(activeCategory)}
          className="p-2 rounded-full bg-white/80 shadow-sm"
        >
          <RefreshCw className="w-5 h-5 text-athar-primary" />
        </button>
      </header>

      {/* Category Tabs */}
      <section className="px-4 py-2 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              activeCategory === cat.key
                ? "bg-athar-primary text-white shadow-md"
                : "bg-white text-athar-text hover:bg-athar-primary/10"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </section>

      {/* Adhkar List */}
      <section className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-athar-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-12 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>تعذر جلب الأذكار</span>
          </div>
        ) : (
          adhkar.map((dhikr, index) => (
            <div key={index} className="athar-card space-y-2">
              <p className="text-base font-medium text-athar-text leading-relaxed">
                {dhikr.text}
              </p>
              {dhikr.count && (
                <span className="inline-block text-xs bg-athar-primary/10 text-athar-primary px-2 py-0.5 rounded-full">
                  {dhikr.count}
                </span>
              )}
              {dhikr.virtue && (
                <p className="text-xs text-athar-muted italic border-r-2 border-athar-accent pr-2 mr-1">
                  {dhikr.virtue}
                </p>
              )}
              <p className="text-xs text-athar-muted">— {dhikr.reference}</p>
            </div>
          ))
        )}
      </section>

      <BottomNav />
    </main>
  );
}
