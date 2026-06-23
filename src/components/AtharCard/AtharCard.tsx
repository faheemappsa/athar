import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getRandomAyah } from "../../services/quranApi";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

export default function AtharCard() {
  const [ayah, setAyah] = useState<{ text: string; surah: string } | null>(null);
  const [lastDate, setLastDate] = useLocalStorage<string>("athar-date", "");
  const [savedContent] = useLocalStorage<string>("athar-content", "");
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
  }, [lastDate, savedContent, setLastDate]);

  useEffect(() => {
    QRCode.toDataURL("https://athar-sandy.vercel.app", { width: 120, margin: 1 }, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);

  const handleShare = async () => {
    if (!cardRef.current || !ayah) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#F8FFFD" });
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
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="w-full rounded-card bg-white p-6 text-center text-secondary-text shadow-xl"
      >
        جاري التحميل...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="w-full overflow-hidden rounded-card bg-white p-6 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div ref={cardRef} className="w-full overflow-hidden rounded-[28px] bg-white p-2">
        <p className="mb-3 text-sm font-medium text-secondary-text">أثر اليوم</p>
        <p className="break-words text-2xl font-bold leading-loose text-primary-text">&quot;{ayah.text}&quot;</p>
        <p className="mt-4 text-base text-secondary-text">— {ayah.surah}</p>
        {qrCodeUrl && (
          <div className="mt-5 flex items-end justify-between border-t border-secondary-text/20 pt-4">
            <span className="text-sm text-secondary-text">أثر</span>
            <img src={qrCodeUrl} alt="QR" className="h-16 w-16 shrink-0 rounded-xl" />
          </div>
        )}
      </div>
      <button
        onClick={handleShare}
        className="mt-5 w-full rounded-full bg-action px-6 py-4 text-lg font-bold text-white shadow-lg shadow-action/20 transition hover:opacity-90"
      >
        شارك الأثر
      </button>
    </motion.div>
  );
}
