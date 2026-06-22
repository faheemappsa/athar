import { useEffect, useState } from "react";
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
    return <div className="bg-card-bg rounded-card p-4 shadow-lg text-center text-secondary-text">جاري التحميل...</div>;
  }

  return (
    <div className="bg-card-bg rounded-card p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary-text">المصحف</h2>
        <span className="text-sm text-secondary-text">الصفحة {page} / 604</span>
      </div>

      <div className="quran-text text-right leading-relaxed text-lg" style={{ fontFamily: "Uthmanic, serif" }}>
        {content}
      </div>

      <div className="flex items-center justify-between mt-4 gap-2">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="bg-action text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          السابق
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="604"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder="رقم الصفحة"
            className="w-20 px-2 py-1 text-center border border-gray-300 rounded-full text-sm focus:outline-none focus:border-action"
          />
          <button
            onClick={handleJump}
            className="bg-action text-white px-3 py-1 rounded-full text-sm font-semibold"
          >
            اذهب
          </button>
        </div>

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= 604}
          className="bg-action text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
