// Athar Constants
// وقف خيري عن مسلم عوده البويني رحمه الله

// WhatsApp Support Number
// TODO: Replace with your real number (format: 9665xxxxxxxx)
export const WHATSAPP_NUMBER = "WHATSAPP_NUMBER_HERE";

// WhatsApp Link
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

// App Info
export const APP_NAME = "أثر";
export const APP_TAGLINE = "كل يوم أثر نور";
export const APP_VERSION = "1.0.0";

// Waqf Info
export const WAQF_NAME = "مسلم عوده البويني";
export const WAQF_DESCRIPTION = "وقف خيري عن مسلم عوده البويني رحمه الله";

// API Endpoints
export const ALADHAN_API = "https://api.aladhan.com/v1";
export const QURAN_API = "https://api.quran.com/api/v4";

// Prayer Calculation Method
// 4 = Umm Al-Qura (Saudi Arabia)
export const PRAYER_METHOD = 4;

// Default Location
export const DEFAULT_CITY = "مكة المكرمة";
export const DEFAULT_LAT = 21.4225;
export const DEFAULT_LNG = 39.8262;

// Athar Categories
export const ATHAR_CATEGORIES = [
  { id: "ayah", name: "آية", icon: "📖" },
  { id: "hadith", name: "حديث", icon: "🕌" },
  { id: "dua", name: "دعاء", icon: "🤲" },
  { id: "dhikr", name: "ذكر", icon: "📿" },
  { id: "hikmah", name: "حكمة", icon: "💡" },
];

// Soul States (for future feature)
export const SOUL_STATES = [
  { id: "darkness", name: "في ظلام", icon: "🌑", atharType: "ayah" },
  { id: "sadness", name: "في حزن", icon: "💔", atharType: "dua" },
  { id: "anger", name: "في غضب", icon: "🔥", atharType: "dhikr" },
  { id: "hope", name: "في أمل", icon: "🌱", atharType: "ayah" },
  { id: "repentance", name: "في توبة", icon: "🌙", atharType: "dua" },
  { id: "challenge", name: "في تحدي", icon: "⚔️", atharType: "hadith" },
  { id: "gratitude", name: "في شكر", icon: "🕊️", atharType: "dhikr" },
];

// Streak Milestones
export const STREAK_MILESTONES = [
  { days: 7, label: "⭐ نجم أول", reward: "دعاء خاص" },
  { days: 30, label: "🌙 قمر مكتمل", reward: "خلفية حصرية" },
  { days: 90, label: "☀️ شمس نور", reward: "أثر طويل" },
  { days: 365, label: "🕊️ حامل الأثر", reward: "لقب ذهبي" },
];

// Share Card Sizes
export const CARD_SIZES = [
  { id: "story", name: "Story", width: 1080, height: 1920 },
  { id: "square", name: "مربعة", width: 1080, height: 1080 },
  { id: "post", name: "4:5", width: 1080, height: 1350 },
];

// Local Storage Keys
export const STORAGE_KEYS = {
  STREAK: "athar-streak",
  LAST_VISIT: "athar-last-visit",
  SAVED_ATHAR: "athar-saved",
  USER_LOCATION: "athar-location",
  PWA_INSTALLED: "athar-pwa-installed",
};
