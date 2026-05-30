// src/lib/api-client.ts
// عميل API موثوق ومجاني للأذكار والآيات (Naikiyah API)

export interface ExternalDhikr {
  id: string;
  arabic: string;
  translation?: string;
  reference?: string;
}

// واجهة برمجة تطبيقات مفتوحة المصدر (بدون مفتاح، مجانية، لا حدود)
const BASE_URL = "https://api.naikiyah.com";

export async function fetchRandomDhikr(count: number = 10): Promise<ExternalDhikr[]> {
  try {
    const response = await fetch(`${BASE_URL}/adkar/random?limit=${count}`, {
      next: { revalidate: 3600 }, // تخزين مؤقت لمدة ساعة
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((item: any, idx: number) => ({
      id: `naikiyah-${Date.now()}-${idx}`,
      arabic: item.dhikr || item.arabic || "سبحان الله",
      translation: item.translation || "",
      reference: item.reference || "أذكار اليوم",
    }));
  } catch (error) {
    console.error("فشل في جلب الأذكار من Naikiyah API:", error);
    return [];
  }
}

export async function fetchSeasonalDhikr(season: string): Promise<ExternalDhikr[]> {
  // مواسم: ramadan, dhul_hijjah, ashura, white_days
  try {
    const response = await fetch(`${BASE_URL}/adkar/seasonal?season=${season}`, {
      next: { revalidate: 86400 }, // تحديث يومي
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((item: any, idx: number) => ({
      id: `seasonal-${season}-${Date.now()}-${idx}`,
      arabic: item.dhikr,
      reference: item.reference,
    }));
  } catch (error) {
    console.error(`فشل في جلب الأذكار الموسمية (${season}):`, error);
    return [];
  }
}
