// Athar API Layer
// جميع دوال جلب البيانات الحية: قرآن، حديث، أذكار، مواقيت، تاريخ هجري، أحداث

// ==================== أنواع البيانات ====================

export interface AtharItem {
  text: string;
  source: string;
  category: "آية" | "حديث" | "دعاء" | "ذكر";
}

export interface PrayerTimesData {
  name: string;
  time: string; // HH:mm
  icon: string;
}

export interface HijriDate {
  day: number;
  month: string;
  year: number;
  weekday: string;
}

export interface IslamicEvent {
  name: string;
  description: string;
  isToday: boolean;
}

// ==================== آية اليوم ====================

export async function fetchAyah(): Promise<AtharItem> {
  try {
    const res = await fetch("https://api.alquran.cloud/v1/ayah/random/ar.asad");
    const data = await res.json();
    if (data.code === 200) {
      return {
        text: data.data.text,
        source: `${data.data.surah.name} ${data.data.numberInSurah}`,
        category: "آية",
      };
    }
  } catch (e) {
    console.error("فشل جلب الآية:", e);
  }
  return fallbackAthar();
}

// ==================== حديث اليوم ====================

export async function fetchHadith(): Promise<AtharItem> {
  try {
    const res = await fetch("https://api.sunnah.com/v1/hadiths/random", {
      headers: { "X-API-Key": "demo" }, // قد تحتاج مفتاح حقيقي لاحقاً
    });
    if (!res.ok) throw new Error("API down");
    const data = await res.json();
    if (data.hadith) {
      return {
        text: data.hadith[0].body,
        source: `${data.hadith[0].collection} — ${data.hadith[0].bookName}`,
        category: "حديث",
      };
    }
  } catch (e) {
    console.error("فشل جلب الحديث:", e);
  }
  return fallbackAthar();
}

// ==================== ذكر/دعاء اليوم ====================

export async function fetchDhikr(): Promise<AtharItem> {
  try {
    const res = await fetch("https://api.hisnmuslim.com/api/duas/random");
    const data = await res.json();
    if (data && data.dua) {
      return {
        text: data.dua.arabic,
        source: data.dua.reference || "حصن المسلم",
        category: "دعاء",
      };
    }
  } catch (e) {
    console.error("فشل جلب الذكر:", e);
  }
  return fallbackAthar();
}

// ==================== الأثر الموحد (آية أو حديث أو دعاء) ====================

export async function fetchDailyAthar(): Promise<AtharItem> {
  const sources = [fetchAyah, fetchHadith, fetchDhikr];
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  return await randomSource();
}

// ==================== مواقيت الصلاة ====================

export async function fetchPrayerTimes(
  lat: number,
  lng: number,
  method: number = 4 // Umm Al-Qura
): Promise<{
  times: PrayerTimesData[];
  hijri: HijriDate;
  nextPrayer: { name: string; time: string };
  timeRemaining: string;
} | null> {
  try {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    const res = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`
    );
    const data = await res.json();
    if (data.code === 200) {
      const timings = data.data.timings;
      const hijri = data.data.date.hijri;
      const prayerIcons: Record<string, string> = {
        Fajr: "🌅",
        Sunrise: "🌇",
        Dhuhr: "☀️",
        Asr: "🌤️",
        Maghrib: "🌆",
        Isha: "🌙",
      };
      const prayerNames = [
        { key: "Fajr", name: "الفجر" },
        { key: "Sunrise", name: "الشروق" },
        { key: "Dhuhr", name: "الظهر" },
        { key: "Asr", name: "العصر" },
        { key: "Maghrib", name: "المغرب" },
        { key: "Isha", name: "العشاء" },
      ];

      const times: PrayerTimesData[] = prayerNames.map((p) => ({
        name: p.name,
        time: timings[p.key].slice(0, 5),
        icon: prayerIcons[p.key] || "🕌",
      }));

      // حساب الصلاة القادمة والوقت المتبقي
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      let nextPrayer = times[0];
      for (const prayer of times) {
        const [h, m] = prayer.time.split(":").map(Number);
        const prayerMinutes = h * 60 + m;
        if (prayerMinutes > currentTime) {
          nextPrayer = prayer;
          break;
        }
      }
      if (!nextPrayer) nextPrayer = times[0]; // اليوم التالي

      const [nh, nm] = nextPrayer.time.split(":").map(Number);
      const nextMinutes = nh * 60 + nm;
      let diffMinutes = nextMinutes - currentTime;
      if (diffMinutes <= 0) diffMinutes += 24 * 60; // اليوم التالي
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      const timeRemaining = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;

      return {
        times,
        hijri: {
          day: parseInt(hijri.day),
          month: hijri.month.ar,
          year: parseInt(hijri.year),
          weekday: hijri.weekday.ar,
        },
        nextPrayer: { name: nextPrayer.name, time: nextPrayer.time },
        timeRemaining,
      };
    }
  } catch (e) {
    console.error("فشل جلب مواقيت الصلاة:", e);
  }
  return null;
}

// ==================== الأحداث الإسلامية ====================

export function getIslamicEvents(hijri: HijriDate, gregorianDate: Date): IslamicEvent[] {
  const events: IslamicEvent[] = [];

  // يوم الجمعة
  if (gregorianDate.getDay() === 5) {
    events.push({ name: "يوم الجمعة", description: "خير يوم طلعت عليه الشمس", isToday: true });
  }

  // رمضان
  if (hijri.month === "رمضان") {
    events.push({
      name: "شهر رمضان المبارك",
      description: "اللهم بلغنا رمضان وتقبله منا",
      isToday: true,
    });
  }

  // العشر الأواخر من رمضان
  if (hijri.month === "رمضان" && hijri.day >= 21) {
    events.push({
      name: "العشر الأواخر",
      description: "تحروا ليلة القدر في العشر الأواخر",
      isToday: true,
    });
  }

  // يوم عرفة (9 ذو الحجة)
  if (hijri.month === "ذو الحجة" && hijri.day === 9) {
    events.push({
      name: "يوم عرفة",
      description: "صيام يوم عرفة يكفر سنتين",
      isToday: true,
    });
  }

  // الأيام البيض (13، 14، 15)
  if (hijri.day === 13 || hijri.day === 14 || hijri.day === 15) {
    events.push({
      name: "الأيام البيض",
      description: "صيام ثلاثة أيام من كل شهر",
      isToday: true,
    });
  }

  // يوم عاشوراء (10 محرم)
  if (hijri.month === "محرم" && hijri.day === 10) {
    events.push({
      name: "يوم عاشوراء",
      description: "صيام يوم عاشوراء يكفر سنة ماضية",
      isToday: true,
    });
  }

  return events;
}

// ==================== احتياطي ====================

function fallbackAthar(): AtharItem {
  const fallbacks: AtharItem[] = [
    {
      text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      source: "البقرة ٢٠١",
      category: "آية",
    },
    {
      text: "إن الله مع الصابرين",
      source: "البقرة ١٥٣",
      category: "آية",
    },
    {
      text: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة",
      source: "حديث صحيح",
      category: "دعاء",
    },
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
