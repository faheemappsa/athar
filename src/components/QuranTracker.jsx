export default function QuranTracker({ onOpenReader }) {
  return (
    <article className="glass-card quran-tracker-card">
      <div className="quran-tracker-content">
        <span className="quran-tracker-label">القرآن الكريم</span>
        <h2>متابعة قراءة القرآن</h2>
        <p className="hint">مساحة مؤقتة لتتبع القراءة اليومية.</p>
      </div>
      <button type="button" className="quran-open-button" onClick={onOpenReader}>
        فتح القارئ
      </button>
    </article>
  );
}
