import { useEffect, useState } from 'react';

const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function toDegrees(value) {
  return (value * 180) / Math.PI;
}

function normalizeCoordinates(coords) {
  if (!coords) return null;

  const latitude = Number(coords.latitude ?? coords.lat);
  const longitude = Number(coords.longitude ?? coords.lng ?? coords.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('إحداثيات غير صالحة');
  }

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('الإحداثيات خارج النطاق الجغرافي');
  }

  return { latitude, longitude };
}

export function calculateQiblaBearing(latitude, longitude) {
  const phi1 = toRadians(latitude);
  const phi2 = toRadians(KAABA_LATITUDE);
  const deltaLambda = toRadians(KAABA_LONGITUDE - longitude);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export default function useQibla(coords) {
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const normalized = normalizeCoordinates(coords);

      if (!normalized) {
        setQiblaAngle(null);
        setError(null);
        return;
      }

      setQiblaAngle(calculateQiblaBearing(normalized.latitude, normalized.longitude));
      setError(null);
    } catch (err) {
      setQiblaAngle(null);
      setError(err.message || 'تعذر حساب اتجاه القبلة');
    }
  }, [coords]);

  return { qiblaAngle, error, loading: false };
}
