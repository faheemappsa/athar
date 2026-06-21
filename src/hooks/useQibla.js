import { useState, useEffect } from 'react';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRadians(deg) {
  return deg * (Math.PI / 180);
}

function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

function calculateBearing(lat, lng) {
  const phi1 = toRadians(lat);
  const phi2 = toRadians(KAABA_LAT);
  const deltaLambda = toRadians(KAABA_LNG - lng);

  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const theta = Math.atan2(y, x);

  return (toDegrees(theta) + 360) % 360;
}

export default function useQibla(coords) {
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coords || coords.latitude == null || coords.longitude == null) {
      setQiblaAngle(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { latitude, longitude } = coords;

      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180
      ) {
        throw new Error('إحداثيات غير صالحة');
      }

      const angle = calculateBearing(latitude, longitude);
      setQiblaAngle(angle);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'تعذر حساب القبلة');
      setLoading(false);
    }
  }, [coords]);

  return { qiblaAngle, error, loading };
}
