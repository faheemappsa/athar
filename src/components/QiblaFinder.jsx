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
      <div className="card-label">اتجاه القبلة</div>
      <h2>{roundedAngle == null ? 'جاهز للحساب' : `${roundedAngle}° من الشمال`}</h2>
      <p className="qibla-intro">بوصلة هادئة تساعدك على التوجه بقلبك قبل جسدك.</p>
      <div className="compass" aria-label="بوصلة القبلة">
        <span className="needle" style={{ transform: `rotate(${roundedAngle ?? 0}deg)` }} />
        <span className="compass-glow" />
        <span className="kaaba">الكعبة</span>
      </div>
      {error ? <p className="error-text">{error}</p> : <p>يمكنك استخدام موقعك الحالي لحساب الاتجاه بدقة أكبر.</p>}
      <button type="button" onClick={useMyLocation}>استخدم موقعي</button>
    </article>
  );
}
