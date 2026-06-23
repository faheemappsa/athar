import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getSmartAthar, type AtharContent } from "../../services/atharEngine";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

const isAtharContent = (value: unknown): value is AtharContent => {
  const item = value as AtharContent;
  return Boolean(
    item &&
      typeof item.id === "string" &&
      typeof item.text === "string" &&
      typeof item.source === "string" &&
      typeof item.time === "string"
  );
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

const shouldRefreshAthar = () => {
  const lastShown = Number(localStorage.getItem("athar-last-shown") || 0);
  const minutes = (Date.now() - lastShown) / 1000 / 60;
  return !lastShown || minutes > 20;
};

export default function AtharCard() {
  const [athar, setAthar] = useState<AtharContent | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const saved = readSavedAthar();

    if (saved && !shouldRefreshAthar()) {
      setAthar(saved);
      return;
    }

    getSmartAthar()
      .then((content) => {
        if (!mounted) return;
        setAthar(content);
        localStorage.setItem("athar-content", JSON.stringify(content));
        localStorage.setItem("athar-last-shown", String(Date.now()));
      })
      .catch(() => {
        if (!mounted) return;
        const fallback: AtharContent = {
          id: "fallback-athar",
          text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
          source: "الرعد: 28",
          kind: "ayah",
          time: "any",
        };
        setAthar(fallback);
        localStorage.setItem("athar-content", JSON.stringify(fallback));
        localStorage.setItem("athar-last-shown", String(Date.now()));
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    QRCode.toDataURL("https://athar-sandy.vercel.app", { width: 120, margin: 1 }, (err, url) => {
      if (!err) setQrCodeUrl(url);
    });
  }, []);

  const handleShare = async () => {
    if (!cardRef.current || !athar) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#F8FFFD" });
      const image = canvas.toDataURL("image/png");
      if (navigator.share) {
        const blob = await fetch(image).then((res) => res.blob());
        const file = new File([blob], "athar.png", { type: "image/png" });
        await navigator.share({ files: [file], title: "أثر اليوم", text: athar.text });
      } else {
        const link = document.createElement("a");
        link.href = image;
        link.download = "athar.png";
        link.click();
      }
    } catch {}
  };

  const refreshAthar = async () => {
    const content = await getSmartAthar();
    setAthar(content);
    localStorage.setItem("athar-content", JSON.stringify(content));
    localStorage.setItem("athar-last-shown", String(Date.now()));
  };

  if (!athar) {
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
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-secondary-text">أثر اليوم</p>
          <button onClick={refreshAthar} className="rounded-full bg-primary-bg px-3 py-1 text-xs font-bold text-action">
            أثر جديد
          </button>
        </div>
        <p className="break-words text-2xl font-bold leading-loose text-primary-text">&quot;{athar.text}&quot;</p>
        <p className="mt-4 text-base text-secondary-text">— {athar.source}</p>
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
