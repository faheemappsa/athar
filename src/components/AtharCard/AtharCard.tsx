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

const getCardMood = (time: AtharContent["time"]) => {
  if (time === "morning") {
    return {
      shell: "from-white via-[#F5FFF8] to-[#E9F7EF]",
      glow: "bg-[#BFEAD0]/40",
      accent: "صباح أثر",
    };
  }

  if (time === "night") {
    return {
      shell: "from-white via-[#F4FBF8] to-[#E1F0EA]",
      glow: "bg-[#7FC7A7]/24",
      accent: "سكون أثر",
    };
  }

  if (time === "pressure") {
    return {
      shell: "from-white via-[#F7FBF8] to-[#EAF4EF]",
      glow: "bg-[#A9DCC4]/28",
      accent: "طمأنينة أثر",
    };
  }

  return {
    shell: "from-white via-[#F8FFFD] to-[#EAF6F3]",
    glow: "bg-[#B8E3CF]/30",
    accent: "أثر اليوم",
  };
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

  const mood = getCardMood(athar.time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="w-full overflow-hidden rounded-card bg-white p-4 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div
        ref={cardRef}
        className={`relative min-h-[430px] w-full overflow-hidden rounded-[32px] bg-gradient-to-br ${mood.shell} px-6 py-8 shadow-inner`}
      >
        <div className={`absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl ${mood.glow}`} />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-action/10" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-action/5" />
        <div className="absolute inset-x-8 top-8 h-40 rounded-b-[90px] border-x border-b border-action/5" />

        <div className="relative z-10 flex min-h-[360px] flex-col items-center justify-between">
          <p className="rounded-full bg-white/70 px-4 py-2 text-xs font-bold text-action shadow-sm backdrop-blur">
            {mood.accent}
          </p>

          <div className="flex flex-1 items-center justify-center py-8">
            <p className="break-words text-[1.72rem] font-extrabold leading-[2.35] text-primary-text">
              {athar.text}
            </p>
          </div>

          <div className="w-full">
            <p className="mb-5 text-sm font-semibold text-secondary-text/85">{athar.source}</p>
            {qrCodeUrl && (
              <div className="flex items-end justify-between border-t border-action/10 pt-4">
                <span className="text-sm font-bold text-action">أثر</span>
                <img src={qrCodeUrl} alt="QR" className="h-14 w-14 shrink-0 rounded-xl bg-white p-1" />
              </div>
            )}
          </div>
        </div>
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
