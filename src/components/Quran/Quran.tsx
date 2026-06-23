import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getQuranPage } from "../../services/quranApi";
import { useLocalStorage } from "../../hooks/useLocalStorage";

type QuranAyah = { text: string; numberInSurah?: number; surah?: { name?: string } };

type QuranPageResponse = {
  text?: string;
  ayahs?: QuranAyah[];
};

export default function Quran() {
  const [page, setPage] = useLocalStorage<number>("quran-page", 1);
  const [content, setContent] = useState<string>("");
  const [surahName, setSurahName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [inputPage, setInputPage] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getQuranPage(page)
      .then((data: QuranPageResponse) => {
        if (!mounted) return;
        const ayahs = Array.isArray(data?.ayahs) ? data.ayahs : [];
        const pageText = ayahs.length > 0 ? ayahs.map((ayah) => ayah.text).join(" ﴿۞﴾ ") : data?.text || "";
        const firstSurah = ayahs[0]?.surah?.name || "";
        setContent(pageText);
        setSurahName(firstSurah);
        if (!pageText) setError("تعذر عرض الصفحة حالياً");
      })
      .catch(() => {
        if (!mounted) return;
        setContent("");
        setSurahName("");
        setError("تعذر تحميل صفحة المصحف");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [page]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > 604) return;
    setPage(newPage);
    setInputPage("");
  };

  const handleJump = () => {
    const num = parseInt(inputPage, 10);
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
        className="w-full overflow-hidden rounded-card bg-white p-6 text-center text-secondary-text shadow-xl"
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
      className="w-full overflow-hidden rounded-card bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-primary-text">المصحف</h2>
          {surahName && <p className="mt-1 text-sm text-secondary-text">{surahName}</p>}
        </div>
        <span className="shrink-0 text-sm text-secondary-text">الصفحة {page} / 604</span>
      </div>

      {error ? (
        <div className="rounded-[24px] bg-primary-bg p-5 text-center text-secondary-text">{error}</div>
      ) : (
        <div className="quran-text max-h-[460px] overflow-y-auto rounded-[24px] bg-primary-bg/50 p-4 text-right text-xl leading-[2.7] text-primary-text" style={{ fontFamily: "serif" }}>
          {content}
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 items-center gap-2">
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
