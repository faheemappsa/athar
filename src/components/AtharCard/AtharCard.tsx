import { useEffect, useState, useRef } from "react";
import { getRandomAyah } from "../../services/quranApi";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

export default function AtharCard() {
  const [ayah, setAyah] = useState<{ text: string; surah: string } | null>(null);
  const [lastDate, setLastDate] = useLocalStorage<string>("athar-date", "");
  const [savedContent, setSavedContent] = useLocalStorage<string>("athar-content", "");
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastDate === today && savedContent) {
      setAyah(JSON.parse(savedContent));
      return;
    }
    getRandomAyah().then((data) => {
      const content = { text: data.text, surah: data.surah.name };
      setAyah(content);
      localStorage.setItem("athar-content", JSON.stringify(content));
      setLastDate(today);
    });
  }, [lastDate, savedContent]);

  useEffect(() => {
    QRCode.toDataURL("https://athar-sandy.vercel.app", { width: 120, margin: 1 }, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);

  const handleShare = async () => {
    if (!cardRef.current || !ayah) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#F5F0E8" });
    const image = canvas.toDataURL("image/png");
    if (navigator.share) {
      try {
        const blob = await fetch(image).then((res) => res.blob());
        const file = new File([blob], "athar.png", { type: "image/png" });
        await navigator.share({ files: [file], title: "أثر اليوم", text: ayah.text });
      } catch {}
    } else {
      const link = document.createElement("a");
      link.href = image;
      link.download = "athar.png";
      link.click();
    }
  };

  if (!ayah) {
    return <div className="bg-card-bg rounded-card p-4 shadow-lg text-center text-secondary-text">جاري التحميل...</div>;
  }

  return (
    <div className="bg-card-bg rounded-card p-6 shadow-lg text-center relative">
      <div ref={cardRef} className="p-4">
        <p className="text-sm text-secondary-text mb-1">أثر اليوم</p>
        <p className="text-xl font-semibold text-primary-text leading-relaxed">&quot;{ayah.text}&quot;</p>
        <p className="text-sm text-secondary-text mt-2">— {ayah.surah}</p>
        {qrCodeUrl && (
          <div className="flex justify-between items-center mt-4 border-t border-secondary-text pt-3">
            <span className="text-xs text-secondary-text font-arabic">أثر</span>
            <img src={qrCodeUrl} alt="QR" className="w-10 h-10" />
          </div>
        )}
      </div>
      <button
        onClick={handleShare}
        className="mt-4 bg-action text-white px-6 py-2 rounded-full text-lg font-semibold shadow-md hover:opacity-90 transition w-full"
      >
        شارك الأثر
      </button>
    </div>
  );
}
