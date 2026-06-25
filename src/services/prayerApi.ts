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

const buildPrayerUrl = (date: string, latitude: number, longitude: number) => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    method: "4",
  });

  return `${BASE_URL}/timings/${date}?${params.toString()}`;
};

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

const refreshPrayerTimes = (date: string, latitude: number, longitude: number) => {
  axios
    .get(buildPrayerUrl(date, latitude, longitude))
    .then((response) => {
      const timings = response.data.data.timings;
      savePrayerTimes({ date, latitude, longitude, timings, updatedAt: Date.now() });
    })
    .catch(() => {});
};

export const getPrayerTimes = async (latitude: number, longitude: number) => {
  const date = getTodayKey();
  const cached = readCachedPrayerTimes();

  if (cached?.date === date && cached.timings) {
    refreshPrayerTimes(date, latitude, longitude);
    return cached.timings;
  }

  try {
    const response = await axios.get(buildPrayerUrl(date, latitude, longitude));
    const timings = response.data.data.timings;
    savePrayerTimes({ date, latitude, longitude, timings, updatedAt: Date.now() });
    return timings;
  } catch (error) {
    if (cached?.timings) return cached.timings;
    throw error;
  }
};
