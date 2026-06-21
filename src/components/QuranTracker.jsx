import { useMemo } from 'react';
import { getQuranProgress } from '../utils/quranStorage';

export default function QuranTracker({ onOpenReader }) {
  const progress = useMemo(() => getQuranProgress(), []);

  return (
    <article className="glass-card quran-tracker-card">
      <div className="quran-tracker-content">
        <span className="quran-tracker-label">القرآن الكريم</span>
        <h2>متابعة قراءة القرآن</h2>
        <p className="hint">
          {progress?.pageNumber ? `آخر صفحة قرأتها: ${progress.pageNumber}` : 'ابدأ قراءة القرآن من الصفحة الأولى.'}
        </p>
      </div>

      <button type="button" className="quran-open-button" onClick={onOpenReader}>
        فتح القارئ
      </button>
    </article>
  );
}