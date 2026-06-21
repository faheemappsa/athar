export default function Welcome({ userName }) {
  return (
    <header className="hero-card">
      <div className="hero-content">
        <p className="eyebrow">أثر — غرفة نور رقمية للذكر والصلاة</p>
        {userName ? (
          <>
            <h1>يا {userName}، ادخل السكينة كأنها مكان.</h1>
            <p className="hero-copy">مواقيت حيّة، أثر يومي، وقبلة تتحرك في فضاء هادئ من الحجر الأسود، العاج، والذهب الخافت.</p>
          </>
        ) : (
          <>
            <h1>رفيق روحاني يشبه دخول محراب من الضوء.</h1>
            <p className="hero-copy">أثر يجمع الذكر، الصلاة القادمة، واتجاه القبلة في تجربة سينمائية هادئة لا تشبه تطبيقات المواقيت التقليدية.</p>
          </>
        )}
        <div className="hero-actions">
          <a href="#prayer-times" className="primary-action">ابدأ من الصلاة القادمة</a>
          <a href="#qibla" className="secondary-action">افتح بوصلة القبلة</a>
        </div>
      </div>
      <div className="hero-orbit" aria-hidden="true">
        <span className="orbit-core">أثر</span>
        <span className="orbit-line orbit-line-one" />
        <span className="orbit-line orbit-line-two" />
        <span className="orbit-line orbit-line-three" />
      </div>
      <div className="scroll-cue" aria-hidden="true">انزل بهدوء</div>
    </header>
  );
}
