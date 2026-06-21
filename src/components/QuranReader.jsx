import { useEffect, useMemo, useState } from 'react';
import { getQuranProgress, markPageRead } from '../utils/quranStorage';

const FIRST_QURAN_PAGE = 1;
const LAST_QURAN_PAGE = 604;
const QURAN_VIEW_WEB_MODULE_URL = 'https://esm.sh/open-quran-view@0.5.0/view/web?bundle';

export default function QuranReader({ onClose }) {
  const savedProgress = useMemo(() => getQuranProgress(), []);
  const [page, setPage] = useState(savedProgress?.pageNumber || FIRST_QURAN_PAGE);
  const [readerStatus, setReaderStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    import(/* @vite-ignore */ QURAN_VIEW_WEB_MODULE_URL).then(
      ({ registerOpenQuranView }) => {
        registerOpenQuranView?.();

        if (isMounted) {
          setReaderStatus('ready');
        }
      },
      () => {
        if (isMounted) {
          setReaderStatus('error');
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    markPageRead(page);
  }, [page]);

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(FIRST_QURAN_PAGE, currentPage - 1));
  };

  const goToNextPage = () => {
    setPage((currentPage) => Math.min(LAST_QURAN_PAGE, currentPage + 1));
  };

  return (
    <div className="quran-reader-backdrop" role="dialog" aria-modal="true" aria-label="قارئ القرآن">
      <section className="quran-reader-card glass-card">
        <div className="quran-reader-header">
          <div>
            <span className="quran-tracker-label">القرآن الكريم</span>
            <h2>قارئ القرآن</h2>
          </div>
          <button type="button" className="quran-close-button" onClick={onClose}>
            إغلاق
          </button>
        </div>

        <div className="quran-reader-toolbar" aria-label="التنقل بين صفحات القرآن">
          <button type="button" className="quran-open-button" onClick={goToNextPage} disabled={page >= LAST_QURAN_PAGE}>
            الصفحة التالية
          </button>
          <span className="quran-page-indicator">صفحة {page} من {LAST_QURAN_PAGE}</span>
          <button type="button" className="quran-open-button" onClick={goToPreviousPage} disabled={page <= FIRST_QURAN_PAGE}>
            الصفحة السابقة
          </button>
        </div>

        <div className="quran-view-shell">
          {readerStatus === 'ready' ? (
            <open-quran-view page={String(page)} mushaf-layout="hafs-v2" fit="width" theme="dark"></open-quran-view>
          ) : (
            <p className="hint">
              {readerStatus === 'loading'
                ? 'جاري تحميل قارئ القرآن…'
                : 'تعذر تحميل قارئ القرآن من المكتبة الآن. يرجى المحاولة لاحقًا.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
