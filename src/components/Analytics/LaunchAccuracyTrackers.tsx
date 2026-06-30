import { useEffect } from "react";
import { trackEvent } from "../../utils/analytics";
import { getSavedAnalyticsLocation } from "../../utils/locationAnalytics";

const CITY_TRACK_KEY = "athar-city-report-track-v1";
const STANDALONE_TRACK_KEY = "athar-standalone-report-track-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const isStandaloneApp = () => {
  try {
    return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
};

const readMarker = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") as { value?: string; at?: number } | null;
  } catch {
    return null;
  }
};

const writeMarker = (key: string, value: string) => {
  try {
    localStorage.setItem(key, JSON.stringify({ value, at: Date.now() }));
  } catch {}
};

const shouldTrack = (key: string, value: string) => {
  const marker = readMarker(key);
  if (!marker?.at || marker.value !== value) return true;
  return Date.now() - marker.at > DAY_MS;
};

export default function LaunchAccuracyTrackers() {
  useEffect(() => {
    if (!isStandaloneApp()) return;
    if (!shouldTrack(STANDALONE_TRACK_KEY, "standalone")) return;

    writeMarker(STANDALONE_TRACK_KEY, "standalone");
    trackEvent("pwa_standalone_install_confirmed", {
      detection: "standalone_open",
    });
  }, []);

  useEffect(() => {
    let checks = 0;
    let stopped = false;

    const trackCity = () => {
      if (stopped) return;
      const city = getSavedAnalyticsLocation();
      if (!city?.city) return;
      const value = `${city.city}-${city.region}`;
      if (!shouldTrack(CITY_TRACK_KEY, value)) return;

      writeMarker(CITY_TRACK_KEY, value);
      trackEvent("prayer_location_city_detected", {
        city: city.city,
        region: city.region,
        city_distance_km: city.distance_km,
      });
    };

    trackCity();
    const interval = window.setInterval(() => {
      checks += 1;
      trackCity();
      if (checks >= 20) window.clearInterval(interval);
    }, 3000);

    const handleReturn = () => trackCity();
    window.addEventListener("focus", handleReturn);
    window.addEventListener("pageshow", handleReturn);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleReturn);
      window.removeEventListener("pageshow", handleReturn);
    };
  }, []);

  return null;
}
