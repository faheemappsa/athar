const PRAYERS = [
  ['الفجر', '04:08'],
  ['الشروق', '05:36'],
  ['الظهر', '12:18'],
  ['العصر', '15:43'],
  ['المغرب', '19:01'],
  ['العشاء', '20:31'],
];

export default function PrayerTimes() {
  const nextPrayer = PRAYERS.find(([, time]) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    return prayerDate > now;
  }) || PRAYERS[0];

  return (
    <article id="prayer-times" className="glass-card prayer-card">
      <div className="card-header">
        <div>
          <div className="card-label">مواقيت الصلاة</div>
          <h2>الموعد القادم: {nextPrayer[0]}</h2>
        </div>
        <strong>{nextPrayer[1]}</strong>
      </div>
      <ul className="prayer-list">
        {PRAYERS.map(([name, time]) => (
          <li key={name} className={name === nextPrayer[0] ? 'is-next' : ''}>
            <span>{name}</span>
            <time>{time}</time>
          </li>
        ))}
      </ul>
      <p className="hint">المواقيت المعروضة افتراضية إلى حين السماح بالموقع أو ربط خدمة المواقيت.</p>
    </article>
  );
}
