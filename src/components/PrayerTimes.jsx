import { useEffect } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import usePrayerCountdown from '../hooks/usePrayerCountdown';
import usePrayerTimes from '../hooks/usePrayerTimes';
import { formatDateTime12Hour, formatTime12Hour } from '../utils/timeFormat';

export default function PrayerTimes() {
  const {
    coords,
    error: locationError,
    loading: locationLoading,
    requestLocation,
    checkCurrentLocation,
    hasStoredCoords,
    locationChanged,
    updateStoredCoords,
  } = useGeolocation();
  const {
    prayers,
    nextPrayer,
    error: prayerError,
    loading: prayerLoading,
    isDefault,
    updatedFromLocation,
  } = usePrayerTimes(coords);
  const countdown = usePrayerCountdown(prayers);
  const highlightedPrayer = countdown.nextPrayer || nextPrayer;
  const displayedNextTime = highlightedPrayer?.displayTime || formatTime12Hour(highlightedPrayer?.time);
  const iqamaDisplayTime = formatDateTime12Hour(countdown.iqamaTime);
  const isLoading = locationLoading || prayerLoading;
  const statusMessage = prayerError || locationError;

  useEffect(() => {
    if (hasStoredCoords) {
      checkCurrentLocation();
    }
  }, [checkCurrentLocation, hasStoredCoords]);

  const hintText = (() => {
    if (prayerLoading) return 'جاري تحديث المواقيت…';
    if (updatedFromLocation && !prayerError) return 'تم تحديث المواقيت حسب موقعك';
    if (isDefault) return 'اعرض مواقيت دقيقة تلقائيًا حسب موقعك الحالي بدل المواقيت الافتراضية.';
    return 'نعرض مواقيت الصلاة بناءً على موقعك المحفوظ.';
  })();

  return (
    <article id="prayer-times" className="glass-card prayer-card">
      <div className="card-header">
        <div>
          <div className="card-label">مواقيت الصلاة</div>
          <h2>الموعد القادم: {highlightedPrayer?.name || nextPrayer.name}</h2>
        </div>
        <strong>{displayedNextTime}</strong>
      </div>

      {countdown.label ? (
        <div className="prayer-countdown" role="timer" aria-live="polite">
          <div>
            <p className="countdown-label">{countdown.label}</p>
            {countdown.phase === 'before-iqama' && countdown.iqamaOffsetMinutes ? (
              <p className="iqama-note">
                الإقامة بعد الأذان بـ {countdown.iqamaOffsetMinutes} دقيقة{iqamaDisplayTime ? ` (${iqamaDisplayTime})` : ''}
              </p>
            ) : null}
          </div>
          <strong className="countdown-time">{countdown.countdownText}</strong>
        </div>
      ) : null}

      <ul className="prayer-list">
        {prayers.map((prayer) => (
          <li key={prayer.key} className={prayer.key === highlightedPrayer?.key ? 'is-next' : ''}>
            <span>{prayer.name}</span>
            <time>{prayer.displayTime}</time>
          </li>
        ))}
      </ul>

      {locationChanged ? (
        <div className="prayer-alert" role="status">
          <span>يبدو أنك في موقع جديد، هل تريد تحديث مواقيت الصلاة؟</span>
          <button type="button" className="location-action" onClick={updateStoredCoords} disabled={isLoading}>
            تحديث موقعي
          </button>
        </div>
      ) : null}

      <p className="hint">{hintText}</p>

      {!hasStoredCoords ? (
        <button type="button" className="location-action" onClick={requestLocation} disabled={isLoading}>
          {locationLoading ? 'جارٍ تحديد موقعك...' : 'استخدم موقعي'}
        </button>
      ) : null}

      {statusMessage ? <p className="error-text prayer-error">{statusMessage}</p> : null}
    </article>
  );
}
