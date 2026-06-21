export default function Welcome({ userName }) {
  return (
    <header className="hero-card">
      <div className="hero-content">
        <p className="eyebrow">أثر — سكينة يومية بنَفَس روحاني</p>
        {userName ? (
          <>
            <h1>ياهلا {userName}، لحظة هادئة قبل زحمة اليوم.</h1>
            <p className="hero-copy">أثر اليوم، المواقيت، العدّ التنازلي، واتجاه القبلة في تجربة واحدة دافئة تشبه نور الفجر.</p>
          </>
        ) : (
          <>
            <h1>رفيق روحاني أنيق لمواقيت الصلاة، الذكر، واتجاه القبلة.</h1>
            <p className="hero-copy">
              تجربة هادئة ومضيئة تساعدك تبدأ يومك بوعي، تعرف الصلاة القادمة، وتستقبل أثرًا يناسب وقتك ومقامك.
            </p>
          </>
        )}
        <div className="hero-actions">
          <a href="#prayer-times" className="primary-action">عرض المواقيت</a>
          <a href="#qibla" className="secondary-action">تحديد القبلة</a>
        </div>
      </div>
      <div className="hero-orbit" aria-hidden="true">
        <span className="orbit-core">أثر</span>
        <span className="orbit-line orbit-line-one" />
        <span className="orbit-line orbit-line-two" />
      </div>
    </header>
  );
}
