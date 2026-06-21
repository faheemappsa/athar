export default function Welcome({ userName }) {
  return (
    <header className="hero-card">
      <div className="brand-lockup" aria-label="أثر">
        <span className="brand-monogram">أثر</span>
        <span className="brand-name">أَثَر</span>
      </div>

      <div className="sun-stage" aria-hidden="true">
        <span className="sun-disc" />
        <span className="horizon-mask" />
        <span className="sun-reflection" />
      </div>

      <div className="hero-text">
        {userName ? (
          <>
            <p className="eyebrow">رحلة اليوم بدأت</p>
            <h1 className="greeting">يا {userName}</h1>
            <p className="sub-greeting">سكينة مركّزة، صلاة أقرب، وورد لا ينقطع.</p>
          </>
        ) : (
          <>
            <p className="eyebrow">رفيقك الروحاني اليومي</p>
            <h1 className="greeting">أثر يضيء يومك</h1>
            <p className="sub-greeting">واجهة هادئة تجمع الأثر، القرآن، الصلاة، والقبلة في تجربة واحدة.</p>
          </>
        )}
      </div>

      <div className="hero-actions">
        <a href="#prayer-times" className="primary-action">الصلاة القادمة</a>
        <a href="#qibla" className="secondary-action">اتجاه القبلة</a>
      </div>
    </header>
  );
}
