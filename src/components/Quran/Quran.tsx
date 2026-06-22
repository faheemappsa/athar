import { useEffect, useState } from "react";
import { getQuranPage } from "../../services/quranApi";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function Quran() {
  const [page, setPage] = useLocalStorage<number>("quran-page", 1);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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
        <span className="text-sm text-secondary-text">{page} / 604</span>
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
