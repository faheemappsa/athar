import { useMemo, useState } from 'react';
import useQibla from '../hooks/useQibla';

export default function QiblaFinder() {
  const [coords, setCoords] = useState({ latitude: 24.7136, longitude: 46.6753 });
  const { qiblaAngle, error } = useQibla(coords);
  const roundedAngle = useMemo(() => (qiblaAngle == null ? null : Math.round(qiblaAngle)), [qiblaAngle]);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }

  return (
    <article id="qibla" className="glass-card qibla-card">
      <div className="qibla-header">
        <div className="card-label">اتجاه القبلة</div>
        <h2>{roundedAngle == null ? '—' : `${roundedAngle}°`}</h2>
      </div>

      <div className="compass" aria-label="بوصلة القبلة">
        <div className="compass-rings">
          <span className="ring ring-outer" />
          <span className="ring ring-middle" />
          <span className="ring ring-inner" />
        </div>
        <span className="compass-north">شمال</span>
        <span className="compass-south">جنوب</span>
        <span className="compass-east">شرق</span>
        <span className="compass-west">غرب</span>
        <span className="needle" style={{ transform: `rotate(${roundedAngle ?? 0}deg)` }}>
          <span className="needle-tip" />
        </span>
        <span className="compass-glow" />
        <span className="kaaba-label">الكعبة</span>
      </div>

      {error ? <p className="error-text">{error}</p> : <p className="qibla-hint">يمكنك استخدام موقعك الحالي لحساب الاتجاه بدقة أكبر.</p>}
      <button type="button" className="location-action" onClick={useMyLocation}>استخدم موقعي</button>
    </article>
  );
}
