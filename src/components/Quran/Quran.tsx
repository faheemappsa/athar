import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "../../hooks/useLocalStorage";

type QuranAyah = {
  text: string;
  numberInSurah: number;
};

type QuranPageResponse = {
  data?: {
    ayahs?: QuranAyah[];
  };
};

const TOTAL_PAGES = 604;

export default function Quran() {
  const [page, setPage] = useLocalStorage<number>("quran-page", 1);
  const [inputPage, setInputPage] = useState("");
  const [pageText, setPageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`)
      .then((response) => response.json())
      .then((data: QuranPageResponse) => {
        if (!isMounted) return;
        const ayahs = data.data?.ayahs || [];
        const text = ayahs.map((ayah) => `${ayah.text} ﴿${ayah.numberInSurah}﴾`).join(" ");
        setPageText(text);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > TOTAL_PAGES) return;
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
      className="w-full overflow-hidden rounded-card bg-white p-3 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-primary-text">المصحف</h2>
        <span className="rounded-full bg-primary-bg px-3 py-1.5 text-xs font-bold text-secondary-text">
          صفحة {page} / {TOTAL_PAGES}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[28px] bg-[#FDFBF7] p-4 shadow-inner">
        {isLoading ? (
          <div className="grid min-h-[430px] place-items-center text-sm font-semibold text-secondary-text">
            جاري تحميل الآيات...
          </div>
        ) : hasError ? (
          <div className="grid min-h-[430px] place-items-center text-center text-sm font-semibold leading-7 text-secondary-text">
            تعذر تحميل صفحة المصحف. تأكد من اتصال الإنترنت ثم حاول مرة أخرى.
          </div>
        ) : (
          <div className="max-h-[62vh] min-h-[430px] overflow-y-auto rounded-[24px] bg-[#FDFBF7] px-3 py-5 text-justify text-[22px] leading-[2.25] text-[#1E1B18]" style={{ fontFamily: '"Traditional Arabic", "Amiri", "Scheherazade New", serif' }}>
            {pageText}
          </div>
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
