export default function QuranReader({ onClose }) {
  return (
    <div className="quran-reader-backdrop" role="dialog" aria-modal="true" aria-label="قارئ القرآن المؤقت">
      <section className="quran-reader-card glass-card">
        <div className="quran-reader-header">
          <h2>قارئ القرآن</h2>
          <button type="button" className="quran-close-button" onClick={onClose}>
            إغلاق
          </button>
        </div>
        <p className="hint">سيتم إضافة قارئ القرآن هنا لاحقًا.</p>
      </section>
    </div>
  );
}
