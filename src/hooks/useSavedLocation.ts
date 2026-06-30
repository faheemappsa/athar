import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../utils/analytics";

export type SavedLocation = {
  lat: number;
  lng: number;
  updatedAt: number;
};

const STORAGE_KEY = "athar-saved-location";
const SILENT_CHECK_KEY = "athar-location-silent-check-at";
const SILENT_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const LOCATION_MAX_AGE_MS = 60 * 60 * 1000;
const SIGNIFICANT_MOVE_KM = 20;

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

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceKm = (from: SavedLocation, to: SavedLocation) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const canRunSilentCheck = () => {
  try {
    const lastCheckAt = Number(localStorage.getItem(SILENT_CHECK_KEY) || 0);
    return Date.now() - lastCheckAt >= SILENT_CHECK_INTERVAL_MS;
  } catch {
    return false;
  }
};

const markSilentCheck = () => {
  try {
    localStorage.setItem(SILENT_CHECK_KEY, String(Date.now()));
  } catch {}
};

const getPositionOptions: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 7000,
  maximumAge: LOCATION_MAX_AGE_MS,
};

const roundCoordinate = (value: number) => Math.round(value * 100) / 100;

export const useSavedLocation = () => {
  const [location, setLocation] = useState<SavedLocation | null>(() => readSavedLocation());
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(() => (readSavedLocation() ? "ready" : "idle"));
  const [error, setError] = useState<string>("");
  const silentCheckInFlightRef = useRef(false);

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

  const trackLocationUpdate = (source: "gps" | "default" | "silent", next?: SavedLocation) => {
    trackEvent("location_updated", {
      location_source: source,
      prayer_location_updated: true,
      gps_lat_approx: next ? roundCoordinate(next.lat) : undefined,
      gps_lng_approx: next ? roundCoordinate(next.lng) : undefined,
      gps_updated_at: next?.updatedAt,
    });
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("ready");
      const next = { ...DEFAULT_LOCATION, updatedAt: Date.now() };
      saveLocation(next);
      trackLocationUpdate("default", next);
      setError("المتصفح لا يدعم تحديد الموقع، استخدمنا موقعاً افتراضياً.");
      return;
    }

    setStatus("loading");
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          updatedAt: Date.now(),
        };
        saveLocation(next);
        trackLocationUpdate("gps", next);
      },
      () => {
        const saved = readSavedLocation();
        if (saved) {
          setLocation(saved);
          setStatus("ready");
        } else {
          const next = { ...DEFAULT_LOCATION, updatedAt: Date.now() };
          saveLocation(next);
          trackLocationUpdate("default", next);
        }
        setError("تعذر تحديد موقعك الآن. يمكنك تحديثه لاحقاً.");
      },
      getPositionOptions
    );
  };

  const silentRefreshLocation = () => {
    if (!navigator.geolocation || silentCheckInFlightRef.current || !canRunSilentCheck()) return;

    const saved = readSavedLocation();
    if (!saved || !saved.updatedAt) return;

    silentCheckInFlightRef.current = true;
    markSilentCheck();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        silentCheckInFlightRef.current = false;
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          updatedAt: Date.now(),
        };
        const movedKm = getDistanceKm(saved, next);
        const isStale = Date.now() - saved.updatedAt >= 24 * 60 * 60 * 1000;
        if (movedKm >= SIGNIFICANT_MOVE_KM || isStale) {
          saveLocation(next);
          trackLocationUpdate("silent", next);
        }
      },
      () => {
        silentCheckInFlightRef.current = false;
      },
      getPositionOptions
    );
  };

  useEffect(() => {
    silentRefreshLocation();

    const handleReturn = () => silentRefreshLocation();
    const handleVisibility = () => {
      if (!document.hidden) silentRefreshLocation();
    };

    window.addEventListener("pageshow", handleReturn);
    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pageshow", handleReturn);
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const useDefaultLocation = () => {
    const next = { ...DEFAULT_LOCATION, updatedAt: Date.now() };
    saveLocation(next);
    trackLocationUpdate("default", next);
  };

  const daysSinceUpdate = location?.updatedAt ? Math.floor((Date.now() - location.updatedAt) / (24 * 60 * 60 * 1000)) : null;
  const shouldRefresh = daysSinceUpdate !== null && daysSinceUpdate >= 7;

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
