import { useEffect, useState } from "react";

export type SavedLocation = {
  lat: number;
  lng: number;
  updatedAt: number;
};

const STORAGE_KEY = "athar-saved-location";
const DEFAULT_LOCATION: SavedLocation = {
  lat: 24.5247,
  lng: 39.5692,
  updatedAt: 0,
};

const readSavedLocation = (): SavedLocation | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as SavedLocation;
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const useSavedLocation = () => {
  const [location, setLocation] = useState<SavedLocation | null>(() => readSavedLocation());
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(() => (readSavedLocation() ? "ready" : "idle"));
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const saved = readSavedLocation();
    if (saved) {
      setLocation(saved);
      setStatus("ready");
    }
  }, []);

  const saveLocation = (next: SavedLocation) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setLocation(next);
    setStatus("ready");
    setError("");
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("ready");
      saveLocation(DEFAULT_LOCATION);
      setError("المتصفح لا يدعم تحديد الموقع، استخدمنا موقعاً افتراضياً.");
      return;
    }

    setStatus("loading");
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          updatedAt: Date.now(),
        });
      },
      () => {
        const saved = readSavedLocation();
        if (saved) {
          setLocation(saved);
          setStatus("ready");
        } else {
          saveLocation(DEFAULT_LOCATION);
        }
        setError("تعذر تحديد موقعك الآن. يمكنك تحديثه لاحقاً.");
      },
      {
        enableHighAccuracy: false,
        timeout: 7000,
        maximumAge: 30 * 24 * 60 * 60 * 1000,
      }
    );
  };

  const useDefaultLocation = () => {
    saveLocation({ ...DEFAULT_LOCATION, updatedAt: Date.now() });
  };

  const daysSinceUpdate = location?.updatedAt ? Math.floor((Date.now() - location.updatedAt) / (24 * 60 * 60 * 1000)) : null;
  const shouldRefresh = daysSinceUpdate !== null && daysSinceUpdate >= 30;

  return {
    location,
    status,
    error,
    requestLocation,
    useDefaultLocation,
    daysSinceUpdate,
    shouldRefresh,
  };
};
