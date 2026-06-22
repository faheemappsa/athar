import { useEffect, useState } from "react";
import { getRandomAyah } from "../../services/quranApi";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function AtharCard() {
  const [ayah, setAyah] = useState<{ text: string; surah: string } | null>(null);
  const [lastDate, setLastDate] = useLocalStorage<string>("athar-date", "");
  const [savedContent, setSavedContent] = useLocalStorage<string>("athar-content", "");

  useEffect(() => {
    const today = new Date().toDateString();

    // If already fetched today, load from localStorage
    if (lastDate === today && savedContent) {
      setAyah(JSON.parse(savedContent));
      return;
    }

    // Fetch new Ayah
    getRandomAyah().then((data) => {
      const content = { text: data.text, surah: data.surah.name };
      setAyah(content);
      localStorage.setItem("athar-content", JSON.stringify(content));
      setLastDate(today);
    });
  }, [lastDate, savedContent]);

  if (!ayah) {
    return <div className="bg-card-bg rounded-card p-4 shadow-lg text-center text-secondary-text">جاري التحميل...</div>;
  }

  return (
    <div className="bg-card-bg rounded-card p-6 shadow-lg text-center">
      <p className="text-sm text-secondary-text mb-1">أثر اليوم</p>
      <p className="text-xl font-semibold text-primary-text leading-relaxed">"{ayah.text}"</p>
      <p className="text-sm text-secondary-text mt-2">— {ayah.surah}</p>
    </div>
  );
}
