export default function Welcome({ userName }) {
  return (
    <header className="hero-card">
      <p className="eyebrow">أثر — رفيقك اليومي للذكر والصلاة</p>
      {userName ? (
        <>
          <h1>ياهلا {userName}</h1>
          <p className="hero-copy">أثر اليوم ومواقيت الصلاة جاهزة لك.</p>
        </>
      ) : (
        <>
          <h1>واجهة هادئة تجمع مواقيت الصلاة، اتجاه القبلة، وأثرًا يلهم يومك.</h1>
          <p className="hero-copy">
            ابدأ يومك بتذكير لطيف، وتابع وقت الصلاة القادم، واحصل على اتجاه القبلة بوضوح من مكانك الحالي.
          </p>
        </>
      )}
      <div className="hero-actions">
        <a href="#prayer-times" className="primary-action">عرض المواقيت</a>
        <a href="#qibla" className="secondary-action">تحديد القبلة</a>
      </div>
    </header>
  );
}
