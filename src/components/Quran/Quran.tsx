import { useState } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const getMushafPageImage = (page: number) => `/mushaf-pages/${String(page).padStart(3, "0")}.png`;

export default function Quran() {
  const [page, setPage] = useLocalStorage<number>("quran-page", 1);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [inputPage, setInputPage] = useState<string>("");

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > 604) return;
    setImageLoaded(false);
    setImageError(false);
    setPage(newPage);
    setInputPage("");
  };

  const handleJump = () => {
    const num = parseInt(inputPage, 10);
    if (!isNaN(num) && num >= 1 && num <= 604) {
      goToPage(num);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full overflow-hidden rounded-card bg-white p-4 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-bold text-primary-text">المصحف</h2>
          <p className="mt-0.5 text-xs text-secondary-text">صفحات مصحف حقيقية</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-bg px-3 py-1.5 text-xs font-bold text-secondary-text">الصفحة {page} / 604</span>
      </div>

      <div className="relative overflow-hidden rounded-[26px] bg-[#FBF7EC] p-2 shadow-inner">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-2 z-10 grid place-items-center rounded-[22px] bg-primary-bg/80 text-sm font-semibold text-secondary-text">
            جاري تجهيز صفحة المصحف...
          </div>
        )}

        {imageError ? (
          <div className="rounded-[22px] bg-primary-bg p-5 text-center text-secondary-text">
            لم يتم العثور على صورة هذه الصفحة بعد.
          </div>
        ) : (
          <img
            key={page}
            src={getMushafPageImage(page)}
            alt={`صفحة ${page} من المصحف`}
            loading="eager"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(false);
              setImageError(true);
            }}
            className={`mx-auto block w-full max-w-[390px] rounded-[18px] bg-white object-contain shadow-sm transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 items-center gap-2">
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
            max="604"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
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
          disabled={page >= 604}
          className="rounded-full bg-action px-3 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </motion.div>
  );
}
