type StoredLocation = {
  lat: number;
  lng: number;
  updatedAt?: number;
};

type City = {
  name: string;
  region: string;
  lat: number;
  lng: number;
};

const LOCATION_KEY = "athar-saved-location";

const cities: City[] = [
  { name: "الرياض", region: "منطقة الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "جدة", region: "منطقة مكة", lat: 21.4858, lng: 39.1925 },
  { name: "مكة", region: "منطقة مكة", lat: 21.3891, lng: 39.8579 },
  { name: "المدينة", region: "منطقة المدينة", lat: 24.5247, lng: 39.5692 },
  { name: "الدمام", region: "المنطقة الشرقية", lat: 26.4207, lng: 50.0888 },
  { name: "الخبر", region: "المنطقة الشرقية", lat: 26.2172, lng: 50.1971 },
  { name: "تبوك", region: "منطقة تبوك", lat: 28.3835, lng: 36.5662 },
  { name: "بريدة", region: "منطقة القصيم", lat: 26.3592, lng: 43.9818 },
  { name: "حائل", region: "منطقة حائل", lat: 27.5114, lng: 41.7208 },
  { name: "أبها", region: "منطقة عسير", lat: 18.2465, lng: 42.5117 },
  { name: "جازان", region: "منطقة جازان", lat: 16.8892, lng: 42.5611 },
  { name: "نجران", region: "منطقة نجران", lat: 17.5656, lng: 44.2289 },
  { name: "عرعر", region: "الحدود الشمالية", lat: 30.9753, lng: 41.0381 },
  { name: "سكاكا", region: "منطقة الجوف", lat: 29.9697, lng: 40.2064 },
  { name: "الباحة", region: "منطقة الباحة", lat: 20.0129, lng: 41.4677 },
];

const toRad = (value: number) => (value * Math.PI) / 180;

const distanceKm = (a: StoredLocation, b: City) => {
  const r = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const getSavedAnalyticsLocation = () => {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const location = JSON.parse(raw) as StoredLocation;
    if (typeof location.lat !== "number" || typeof location.lng !== "number") return null;

    const nearest = cities
      .map((city) => ({ ...city, distance: distanceKm(location, city) }))
      .sort((a, b) => a.distance - b.distance)[0];

    return {
      city: nearest?.name || "غير معروف",
      region: nearest?.region || "غير معروف",
      distance_km: Math.round(nearest?.distance || 0),
    };
  } catch {
    return null;
  }
};
