export default function Footer() {
  return (
    <footer className="site-footer">
      <p>أثر © {new Date().getFullYear()} — تجربة روحانية خفيفة لليوم والليلة.</p>
      <nav aria-label="روابط سريعة">
        <a href="#prayer-times">المواقيت</a>
        <a href="#qibla">القبلة</a>
      </nav>
    </footer>
  );
}
