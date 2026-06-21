export default function Welcome({ userName }) {
  return (
    <header className="hero-card">
      <div className="hero-content">
        <div className="hero-ring" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="sacred-ring">
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="1" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(212, 175, 55, 0.1)" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="2" strokeDasharray="8 12" />
            <circle cx="100" cy="100" r="20" fill="rgba(212, 175, 55, 0.08)" stroke="rgba(212, 175, 55, 0.3)" strokeWidth="1" />
          </svg>
          <span className="ring-core">أثر</span>
        </div>

        <div className="hero-text">
          {userName ? (
            <>
              <h1 className="greeting">يا {userName}</h1>
              <p className="sub-greeting">ادخل السكينة كأنها مكان</p>
            </>
          ) : (
            <>
              <h1 className="greeting">رفيق روحاني</h1>
              <p className="sub-greeting">من نور الذكر إلى قبلة القلب</p>
            </>
          )}
        </div>

        <div className="hero-actions">
          <a href="#prayer-times" className="primary-action">الصلاة القادمة</a>
          <a href="#qibla" className="secondary-action">اتجاه القبلة</a>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span>انزل بهدوء</span>
        <span className="cue-chevron">⌄</span>
      </div>
    </header>
  );
}
