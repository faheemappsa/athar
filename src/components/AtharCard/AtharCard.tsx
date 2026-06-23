import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getRandomAyah } from "../../services/quranApi";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

type AtharContent = { text: string; surah: string };

const isAtharContent = (value: unknown): value is AtharContent => {
  const item = value as AtharContent;
  return Boolean(item && typeof item.text === "string" && typeof item.surah === "string");
};

const readSavedAthar = (): AtharContent | null => {
  try {
    const raw = localStorage.getItem("athar-content");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isAtharContent(parsed) ? parsed : null;
  } catch {
    localStorage.removeItem("athar-content");
    return null;
  }
};

export default function AtharCard() {
  const [ayah, setAyah] = useState<AtharContent | null>(null);
  const [lastDate, setLastDate] = useLocalStorage<string>("athar-date", "");
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const today = new Date().toDateString();
    const saved = readSavedAthar();

    if (lastDate === today && saved) {
      setAyah(saved);
      return;
    }

    getRandomAyah()
      .then((data) => {
        if (!mounted) return;
        const content = { text: data.text, surah: data.surah.name };
        setAyah(content);
        localStorage.setItem("athar-content", JSON.stringify(content));
        setLastDate(today);
      })
      .catch(() => {
        if (!mounted) return;
        const fallback = { text: "لِمِثْلِ هَٰذَا فَلْيَعْمَلِ الْعَامِلُونَ", surah: "سورة الصافات" };
        setAyah(fallback);
        localStorage.setItem("athar-content", JSON.stringify(fallback));
        setLastDate(today);
      });

    return () => {
      mounted = false;
    };
  }, [lastDate, setLastDate]);

  useEffect(() => {
    QRCode.toDataURL("https://athar-sandy.vercel.app", { width: 120, margin: 1 }, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);

  const handleShare = async () => {
    if (!cardRef.current || !ayah) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#F8FFFD" });
      const image = canvas.toDataURL("image/png");
      if (navigator.share) {
        const blob = await fetch(image).then((res) => res.blob());
        const file = new File([blob], "athar.png", { type: "image/png" });
        await navigator.share({ files: [file], title: "أثر اليوم", text: ayah.text });
      } else {
        const link = document.createElement("a");
        link.href = image;
        link.download = "athar.png";
        link.click();
      }
    } catch {}
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
