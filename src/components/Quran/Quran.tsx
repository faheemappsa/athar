import { useState } from "react";
import { motion } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const MUSHAF_PDF_URL = "https://qurancomplex.gov.sa/wp-content/uploads/isdarat/hafs/mumtaz-1.pdf";
const TOTAL_PAGES = 604;

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

export default function Quran() {
  const [page, setPage] = useLocalStorage<number>("quran-page", 1);
  const [inputPage, setInputPage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > TOTAL_PAGES) return;
    setIsLoading(true);
    setHasError(false);
    setPage(nextPage);
    setInputPage("");
  };

  const handleJump = () => {
    const nextPage = Number(inputPage);
    if (!Number.isNaN(nextPage)) goToPage(nextPage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full overflow-hidden rounded-card bg-white p-2 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="rounded-full bg-primary-bg px-3 py-1.5 text-xs font-bold text-secondary-text">
          صفحة {page} / {TOTAL_PAGES}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[28px] bg-[#FBF7EC] p-1.5 shadow-inner">
        {isLoading && !hasError && (
          <div className="absolute inset-2 z-10 grid place-items-center rounded-[24px] bg-primary-bg/90 text-sm font-semibold text-secondary-text">
            جاري تجهيز صفحة المصحف...
          </div>
        )}

        {hasError ? (
          <div className="rounded-[24px] bg-primary-bg p-6 text-center text-sm font-semibold leading-7 text-secondary-text">
            تعذر تحميل صفحة المصحف. تأكد من اتصال الإنترنت ثم حاول مرة أخرى.
          </div>
        ) : (
          <Document
            file={MUSHAF_PDF_URL}
            loading=""
            onLoadError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          >
            <Page
              pageNumber={page}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              width={390}
              loading=""
              onRenderSuccess={() => setIsLoading(false)}
              className="mx-auto overflow-hidden rounded-[24px] bg-white shadow-sm"
            />
          </Document>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 items-center gap-2">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="rounded-full bg-action px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          السابق
        </button>

        <div className="flex items-center justify-center gap-1">
          <input
            type="number"
            min="1"
            max={TOTAL_PAGES}
            value={inputPage}
            onChange={(event) => setInputPage(event.target.value)}
            placeholder="صفحة"
            className="w-16 rounded-full border border-secondary-text/40 bg-white px-2 py-3 text-center text-sm text-primary-text focus:border-action focus:outline-none"
          />
          <button
            onClick={handleJump}
            className="rounded-full bg-action px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            اذهب
          </button>
        </div>

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= TOTAL_PAGES}
          className="rounded-full bg-action px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </motion.div>
  );
}
