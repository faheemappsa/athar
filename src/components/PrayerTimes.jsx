import useGeolocation from '../hooks/useGeolocation';
import usePrayerTimes from '../hooks/usePrayerTimes';

export default function PrayerTimes() {
  const {
    coords,
    error: locationError,
    loading: locationLoading,
    requestLocation,
  } = useGeolocation();
  const {
    prayers,
    nextPrayer,
    locationName,
    dateLabel,
    error: prayerError,
    loading: prayerLoading,
    isDefault,
  } = usePrayerTimes(coords);
  const isLoading = locationLoading || prayerLoading;
  const statusMessage = prayerError || locationError;

  return (
    <article id="prayer-times" className="glass-card prayer-card">
      <div className="card-header">
        <div>
          <div className="card-label">مواقيت الصلاة</div>
          <h2>الموعد القادم: {nextPrayer.name}</h2>
        </div>
        <strong>{nextPrayer.time}</strong>
      </div>

      <div className="prayer-location" aria-live="polite">
        <span>{locationName}</span>
        {dateLabel ? <small>{dateLabel}</small> : null}
      </div>

      <ul className="prayer-list">
        {prayers.map((prayer) => (
          <li key={prayer.key} className={prayer.key === nextPrayer.key ? 'is-next' : ''}>
            <span>{prayer.name}</span>
            <time>{prayer.time}</time>
          </li>
        ))}
      </ul>

      {statusMessage ? <p className="error-text">{statusMessage}</p> : null}
      <p className="hint">
        {isDefault
          ? 'اعرض مواقيت دقيقة تلقائيًا حسب موقعك الحالي بدل المواقيت الافتراضية.'
          : 'تم تحديث المواقيت حسب إحداثيات موقعك الحالي.'}
      </p>
      <button type="button" className="location-action" onClick={requestLocation} disabled={isLoading}>
        {isLoading ? 'جارٍ التحديث...' : 'استخدم موقعي للمواقيت'}
      </button>
    </article>
  );
}
