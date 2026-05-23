// Athar API Layer
// جميع دوال جلب البيانات الحية: قرآن، حديث، أذكار، مواقيت، تاريخ هجري، أحداث، موقع

// ==================== أنواع البيانات ====================

export interface AtharItem {
  text: string;
  source: string;
  category: "آية" | "حديث" | "دعاء" | "ذكر";
}

export interface PrayerTimesData {
  name: string;
  time: string; // HH:mm (أذان)
  iqamah: string; // HH:mm (إقامة)
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
      headers: { "X-API-Key": "demo" },
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

// ==================== اسم المدينة من الإحداثيات ====================

export async function fetchCityName(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
      {
        headers: {
          "User-Agent": "AtharApp/1.0 (athar-sandy.vercel.app)",
        },
      }
    );
    const data = await res.json();
    if (data && data.address) {
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.region ||
        data.address.state ||
        "موقعي";
      return city;
    }
  } catch (e) {
    console.error("فشل جلب اسم المدينة:", e);
  }
  return "موقعي";
}

// ==================== حساب وقت الإقامة ====================

function calculateIqamah(athanTime: string, prayerName: string): string {
  const [hours, minutes] = athanTime.split(":").map(Number);
  if (prayerName === "الضحى") return athanTime; // الضحى ليس لها إقامة
  const delay = (prayerName === "الفجر" || prayerName === "العشاء") ? 10 : 15;
  const totalMinutes = hours * 60 + minutes + delay;
  const iqamahHours = Math.floor(totalMinutes / 60) % 24;
  const iqamahMinutes = totalMinutes % 60;
  return `${String(iqamahHours).padStart(2, "0")}:${String(iqamahMinutes).padStart(2, "0")}`;
}

// ==================== مواقيت الصلاة ====================

export async function fetchPrayerTimes(
  lat: number,
  lng: number,
  method: number = 4
): Promise<{
  times: PrayerTimesData[];
  hijri: HijriDate;
  nextPrayer: { name: string; time: string; iqamah: string };
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
        Duha: "☀️",
        Dhuhr: "☀️",
        Asr: "🌤️",
        Maghrib: "🌆",
        Isha: "🌙",
      };

      // استخراج أوقات الفجر والظهر والشروق (بالدقائق)
      const [fajrH, fajrM] = timings.Fajr.slice(0, 5).split(":").map(Number);
      const [dhuhrH, dhuhrM] = timings.Dhuhr.slice(0, 5).split(":").map(Number);
      
      const fajrTotal = fajrH * 60 + fajrM;
      const dhuhrTotal = dhuhrH * 60 + dhuhrM;

      // حساب وقت بدء الضحى (الفجر + 120 دقيقة)
      let duhaStartTotal = fajrTotal + 120;
      const duhaStartH = Math.floor(duhaStartTotal / 60) % 24;
      const duhaStartM = duhaStartTotal % 60;
      const duhaStart = `${String(duhaStartH).padStart(2, "0")}:${String(duhaStartM).padStart(2, "0")}`;

      // حساب وقت انتهاء الضحى (قبل الظهر بـ 10 دقائق)
      let duhaEndTotal = dhuhrTotal - 10;
      const duhaEndH = Math.floor(duhaEndTotal / 60) % 24;
      const duhaEndM = duhaEndTotal % 60;
      const duhaEnd = `${String(duhaEndH).padStart(2, "0")}:${String(duhaEndM).padStart(2, "0")}`;

      const prayerNames = [
        { key: "Fajr", name: "الفجر", time: timings.Fajr },
        { key: "Sunrise", name: "الشروق", time: timings.Sunrise },
        { key: "Duha", name: "الضحى", time: duhaStart },
        { key: "Dhuhr", name: "الظهر", time: timings.Dhuhr },
        { key: "Asr", name: "العصر", time: timings.Asr },
        { key: "Maghrib", name: "المغرب", time: timings.Maghrib },
        { key: "Isha", name: "العشاء", time: timings.Isha },
      ];

      const times: PrayerTimesData[] = prayerNames.map((p) => {
        const athanTime = p.time.slice(0, 5);
        const iqamahTime = calculateIqamah(athanTime, p.name);
        return {
          name: p.name,
          time: athanTime,
          iqamah: iqamahTime,
          icon: prayerIcons[p.key] || "🕌",
        };
      });

      // حساب الصلاة القادمة
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
      if (!nextPrayer) nextPrayer = times[0];

      const [nh, nm] = nextPrayer.time.split(":").map(Number);
      const nextMinutes = nh * 60 + nm;
      let diffMinutes = nextMinutes - currentTime;
      if (diffMinutes <= 0) diffMinutes += 24 * 60;
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
        nextPrayer: { name: nextPrayer.name, time: nextPrayer.time, iqamah: nextPrayer.iqamah },
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

  if (gregorianDate.getDay() === 5) {
    events.push({ name: "يوم الجمعة", description: "خير يوم طلعت عليه الشمس", isToday: true });
  }

  if (hijri.month === "رمضان") {
    events.push({
      name: "شهر رمضان المبارك",
      description: "اللهم بلغنا رمضان وتقبله منا",
      isToday: true,
    });
  }

  if (hijri.month === "رمضان" && hijri.day >= 21) {
    events.push({
      name: "العشر الأواخر",
      description: "تحروا ليلة القدر في العشر الأواخر",
      isToday: true,
    });
  }

  if (hijri.month === "ذو الحجة" && hijri.day === 9) {
    events.push({
      name: "يوم عرفة",
      description: "صيام يوم عرفة يكفر سنتين",
      isToday: true,
    });
  }

  if (hijri.day === 13 || hijri.day === 14 || hijri.day === 15) {
    events.push({
      name: "الأيام البيض",
      description: "صيام ثلاثة أيام من كل شهر",
      isToday: true,
    });
  }

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
