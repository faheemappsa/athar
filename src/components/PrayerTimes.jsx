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
      <div className="prayer-orbit" aria-hidden="true">
        <span className="orbit-ring ring-1" />
        <span className="orbit-ring ring-2" />
        <span className="orbit-ring ring-3" />
      </div>

      <div className="prayer-header">
        <div className="prayer-label">مواقيت الصلاة</div>
        <div className="next-prayer-block">
          <span className="next-prayer-name">{highlightedPrayer?.name}</span>
          <strong className="next-prayer-time">{displayedNextTime}</strong>
        </div>
      </div>

      {countdown.label ? (
        <div className="prayer-countdown" role="timer" aria-live="polite">
          <div className="countdown-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(212, 175, 55, 0.1)" strokeWidth="2" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="283" strokeDashoffset="0" />
            </svg>
          </div>
          <div className="countdown-text">
            <span className="countdown-label">{countdown.label}</span>
            <strong className="countdown-time">{countdown.countdownText}</strong>
            {countdown.phase === 'before-iqama' && countdown.iqamaOffsetMinutes ? (
              <span className="iqama-note">
                الإقامة بعد الأذان بـ {countdown.iqamaOffsetMinutes} دقيقة{iqamaDisplayTime ? ` (${iqamaDisplayTime})` : ''}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <ul className="prayer-list">
        {prayers.map((prayer) => (
          <li key={prayer.key} className={prayer.key === highlightedPrayer?.key ? 'is-next' : ''} tabIndex="0">
            <span className="prayer-name">{prayer.name}</span>
            <time className="prayer-time">{prayer.displayTime}</time>
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
