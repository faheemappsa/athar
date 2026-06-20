import { useMemo } from 'react';

const KAABA_LATITUDE = 21.422487;
const KAABA_LONGITUDE = 39.826206;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

function calculateQiblaAngle(latitude, longitude) {
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA_LATITUDE);
  const deltaLongitude = toRadians(KAABA_LONGITUDE - longitude);

  const y = Math.sin(deltaLongitude);
  const x =
    Math.cos(lat1) * Math.tan(lat2) -
    Math.sin(lat1) * Math.cos(deltaLongitude);

  const angle = toDegrees(Math.atan2(y, x));

  return (angle + 360) % 360;
}

export default function useQibla(coords) {
  return useMemo(() => {
    if (!coords) {
      return {
        qiblaAngle: null,
        error: null,
        loading: false
      };
    }

    const { latitude, longitude } = coords;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number'
    ) {
      return {
        qiblaAngle: null,
        error: 'إحداثيات الموقع غير صالحة',
        loading: false
      };
    }

    return {
      qiblaAngle: calculateQiblaAngle(latitude, longitude),
      error: null,
      loading: false
    };
  }, [coords]);
}
