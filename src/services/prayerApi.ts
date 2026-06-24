import axios from "axios";

const BASE_URL = "https://api.aladhan.com/v1";
const CACHE_KEY = "athar-prayer-times-cache";

type PrayerTimesCache = {
  date: string;
  latitude: number;
  longitude: number;
  timings: Record<string, string>;
  updatedAt: number;
};

const getTodayKey = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

const readCachedPrayerTimes = (): PrayerTimesCache | null => {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as PrayerTimesCache;
    if (!parsed?.timings || typeof parsed.timings !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const savePrayerTimes = (cache: PrayerTimesCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

export const getPrayerTimes = async (latitude: number, longitude: number) => {
  const date = getTodayKey();

  try {
    const response = await axios.get(`${BASE_URL}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=4`);
    const timings = response.data.data.timings;
    savePrayerTimes({ date, latitude, longitude, timings, updatedAt: Date.now() });
    return timings;
  } catch (error) {
    const cached = readCachedPrayerTimes();
    if (cached?.timings) return cached.timings;
    throw error;
  }
};
