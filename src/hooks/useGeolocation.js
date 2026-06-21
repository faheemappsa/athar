import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'athar-user-coordinates';
const LOCATION_CHANGE_THRESHOLD_KM = 5;
const DEFAULT_ERROR = 'تعذر تحديد موقعك الحالي.';

function normalizeCoords(coords) {
  if (!coords) return null;

  const latitude = Number(coords.latitude);
  const longitude = Number(coords.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  return { latitude, longitude };
}

function readStoredCoords() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    return normalizeCoords(JSON.parse(storedValue));
  } catch {
    return null;
  }
}

function saveStoredCoords(coords) {
  const normalized = normalizeCoords(coords);

  if (!normalized) return null;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('المتصفح لا يدعم تحديد الموقع.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      reject,
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 1000 * 60 * 10,
      },
    );
  });
}

function getFriendlyError(error) {
  if (error?.code === error?.PERMISSION_DENIED || error?.code === 1) {
    return 'لم يتم السماح بالوصول للموقع.';
  }

  return error?.message || DEFAULT_ERROR;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(coordsA, coordsB) {
  const first = normalizeCoords(coordsA);
  const second = normalizeCoords(coordsB);

  if (!first || !second) return 0;

  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(second.latitude - first.latitude);
  const deltaLongitude = toRadians(second.longitude - first.longitude);
  const startLatitude = toRadians(first.latitude);
  const endLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

export default function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [hasStoredCoords, setHasStoredCoords] = useState(false);
  const [locationChanged, setLocationChanged] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedCoords = readStoredCoords();

    if (storedCoords) {
      setCoords(storedCoords);
      setHasStoredCoords(true);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentCoords = await getPosition();
      const savedCoords = saveStoredCoords(currentCoords);

      setCoords(savedCoords);
      setPendingCoords(null);
      setHasStoredCoords(Boolean(savedCoords));
      setLocationChanged(false);
    } catch (geoError) {
      setError(getFriendlyError(geoError));
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCurrentLocation = useCallback(async () => {
    const storedCoords = readStoredCoords();

    if (!storedCoords) return;

    setError(null);

    try {
      const currentCoords = await getPosition();
      const distanceKm = calculateDistanceKm(storedCoords, currentCoords);

      if (distanceKm > LOCATION_CHANGE_THRESHOLD_KM) {
        setPendingCoords(currentCoords);
        setLocationChanged(true);
      } else {
        setPendingCoords(null);
        setLocationChanged(false);
      }
    } catch {
      setLocationChanged(false);
    }
  }, []);

  const updateStoredCoords = useCallback(() => {
    if (!pendingCoords) {
      requestLocation();
      return;
    }

    const savedCoords = saveStoredCoords(pendingCoords);

    setCoords(savedCoords);
    setPendingCoords(null);
    setHasStoredCoords(Boolean(savedCoords));
    setLocationChanged(false);
    setError(null);
  }, [pendingCoords, requestLocation]);

  return {
    coords,
    loading,
    error,
    requestLocation,
    checkCurrentLocation,
    hasStoredCoords,
    locationChanged,
    updateStoredCoords,
  };
}
