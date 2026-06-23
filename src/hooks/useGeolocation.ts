import { useEffect, useState } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled && !location) setError("Geolocation timeout");
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        window.clearTimeout(timeout);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        if (cancelled) return;
        window.clearTimeout(timeout);
        setError(err.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 7000,
        maximumAge: 10 * 60 * 1000,
      }
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return { location, error };
};
