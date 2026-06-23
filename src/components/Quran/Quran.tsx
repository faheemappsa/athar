import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getQuranPage } from "../../services/quranApi";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function Quran() {
  const [page, setPage] = useLocalStorage<number>("quran-page", 1);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [inputPage, setInputPage] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    getQuranPage(page)
      .then((data) => {
        setContent(data.text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > 604) return;
    setPage(newPage);
    setInputPage("");
  };

  const handleJump = () => {
    const num = parseInt(inputPage);
    if (!isNaN(num) && num >= 1 && num <= 604) {
      goToPage(num);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full overflow-hidden rounded-card bg-white p-5 text-center text-secondary-text shadow-xl"
      >
        جاري التحميل...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full overflow-hidden rounded-card bg-white p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-primary-text">المصحف</h2>
        <span className="shrink-0 text-sm text-secondary-text">الصفحة {page} / 604</span>
      </div>

      <div className="quran-text text-right text-lg leading-loose text-primary-text" style={{ fontFamily: "Uthmanic, serif" }}>
        {content}
      </div>

      <div className="mt-4 grid grid-cols-3 items-center gap-2">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="rounded-full bg-action px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="w-16 rounded-full border border-secondary-text/40 px-2 py-2 text-center text-xs text-primary-text focus:border-action focus:outline-none"
          />
          <button
            onClick={handleJump}
            className="rounded-full bg-action px-2 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            اذهب
          </button>
        </div>

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= 604}
          className="rounded-full bg-action px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          التالي
        </button>
      </div>
    </motion.div>
  );
}
