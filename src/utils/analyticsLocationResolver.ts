type AnalyticsLocationInput = {
  lat: number;
  lng: number;
};

type AnalyticsCity = {
  name: string;
  region: string;
  lat: number;
  lng: number;
};

const MATCH_LIMIT_KM = 180;

const cities: AnalyticsCity[] = [
  { name: "الرياض", region: "منطقة الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "جدة", region: "منطقة مكة", lat: 21.4858, lng: 39.1925 },
  { name: "مكة", region: "منطقة مكة", lat: 21.3891, lng: 39.8579 },
  { name: "المدينة", region: "منطقة المدينة", lat: 24.5247, lng: 39.5692 },
  { name: "الدمام", region: "المنطقة الشرقية", lat: 26.4207, lng: 50.0888 },
  { name: "الخبر", region: "المنطقة الشرقية", lat: 26.2172, lng: 50.1971 },
  { name: "تبوك", region: "منطقة تبوك", lat: 28.3835, lng: 36.5662 },
  { name: "تيماء", region: "منطقة تبوك", lat: 27.6333, lng: 38.5333 },
  { name: "ضباء", region: "منطقة تبوك", lat: 27.3495, lng: 35.6969 },
  { name: "الوجه", region: "منطقة تبوك", lat: 26.2456, lng: 36.4525 },
  { name: "حقل", region: "منطقة تبوك", lat: 29.2833, lng: 34.95 },
  { name: "أملج", region: "منطقة تبوك", lat: 25.0213, lng: 37.2685 },
  { name: "العلا", region: "منطقة المدينة", lat: 26.6085, lng: 37.9232 },
  { name: "ينبع", region: "منطقة المدينة", lat: 24.0889, lng: 38.0637 },
  { name: "بريدة", region: "منطقة القصيم", lat: 26.3592, lng: 43.9818 },
  { name: "عنيزة", region: "منطقة القصيم", lat: 26.0843, lng: 43.9936 },
  { name: "حائل", region: "منطقة حائل", lat: 27.5114, lng: 41.7208 },
  { name: "أبها", region: "منطقة عسير", lat: 18.2465, lng: 42.5117 },
  { name: "خميس مشيط", region: "منطقة عسير", lat: 18.3064, lng: 42.7292 },
  { name: "جازان", region: "منطقة جازان", lat: 16.8892, lng: 42.5611 },
  { name: "نجران", region: "منطقة نجران", lat: 17.5656, lng: 44.2289 },
  { name: "عرعر", region: "الحدود الشمالية", lat: 30.9753, lng: 41.0381 },
  { name: "سكاكا", region: "منطقة الجوف", lat: 29.9697, lng: 40.2064 },
  { name: "القريات", region: "منطقة الجوف", lat: 31.3318, lng: 37.3428 },
  { name: "الباحة", region: "منطقة الباحة", lat: 20.0129, lng: 41.4677 },
  { name: "الطائف", region: "منطقة مكة", lat: 21.4373, lng: 40.5127 },
  { name: "الهفوف", region: "المنطقة الشرقية", lat: 25.3833, lng: 49.5833 },
  { name: "الجبيل", region: "المنطقة الشرقية", lat: 27.0046, lng: 49.646 },
  { name: "حفر الباطن", region: "المنطقة الشرقية", lat: 28.4342, lng: 45.9636 },
];

const toRad = (value: number) => (value * Math.PI) / 180;

const distanceKm = (from: AnalyticsLocationInput, to: AnalyticsCity) => {
  const earthRadiusKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const resolveAnalyticsLocationFromCoords = (location: AnalyticsLocationInput | null) => {
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return null;

  const nearest = cities
    .map((city) => ({ ...city, distance: distanceKm(location, city) }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearest || nearest.distance > MATCH_LIMIT_KM) return null;

  return {
    city: nearest.name,
    region: nearest.region,
    city_distance_km: Math.round(nearest.distance),
  };
};
