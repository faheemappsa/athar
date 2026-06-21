import { useCallback, useState } from 'react';

const DEFAULT_ERROR = 'تعذر تحديد موقعك الحالي. تأكد من السماح بالوصول للموقع.';

export default function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع الجغرافي.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (geoError) => {
        const message = geoError.code === geoError.PERMISSION_DENIED
          ? 'لم يتم السماح بالوصول للموقع. يمكنك تفعيل الإذن من إعدادات المتصفح.'
          : DEFAULT_ERROR;

        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 1000 * 60 * 10,
      },
    );
  }, []);

  return { coords, error, loading, requestLocation };
}
