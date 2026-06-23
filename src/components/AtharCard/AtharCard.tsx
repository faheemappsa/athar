import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getSmartAthar, type AtharContent } from "../../services/atharEngine";
import html2canvas from "html2canvas";

const getCardMood = (time: AtharContent["time"]) => {
  if (time === "morning") {
    return {
      shell: "from-white via-[#F8FFF9] to-[#EAF7EF]",
      glow: "bg-[#CBEFD8]/35",
    };
  }

  if (time === "night") {
    return {
      shell: "from-white via-[#F4FBF8] to-[#E2F0EA]",
      glow: "bg-[#7FC7A7]/22",
    };
  }

  if (time === "pressure") {
    return {
      shell: "from-white via-[#F8FBF8] to-[#ECF5F0]",
      glow: "bg-[#A9DCC4]/24",
    };
  }

  return {
    shell: "from-white via-[#F8FFFD] to-[#EAF6F3]",
    glow: "bg-[#B8E3CF]/26",
  };
};

export default function AtharCard() {
  const [athar, setAthar] = useState<AtharContent | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

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
      });

    return () => {
      mounted = false;
    };
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
        className={`relative min-h-[430px] w-full overflow-hidden rounded-[32px] bg-gradient-to-br ${mood.shell} px-7 py-9 shadow-inner`}
      >
        <div className={`absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full blur-3xl ${mood.glow}`} />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-action/8" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-action/5" />
        <div className="absolute inset-x-8 top-10 h-44 rounded-b-[96px] border-x border-b border-action/5" />

        <div className="relative z-10 flex min-h-[352px] flex-col items-center justify-between">
          <p className="text-sm font-bold tracking-wide text-action/80">أثر اليوم</p>

          <div className="flex flex-1 items-center justify-center py-9">
            <p className="break-words text-[1.72rem] font-extrabold leading-[2.35] text-primary-text">
              {athar.text}
            </p>
          </div>

          <p className="text-sm font-semibold text-secondary-text/80">{athar.source}</p>
        </div>
      </div>
      <button
        onClick={handleShare}
        className="mt-5 w-full rounded-full bg-action px-6 py-4 text-lg font-bold text-white shadow-lg shadow-action/20 transition hover:opacity-90 active:scale-[0.98]"
      >
        شارك الأثر
      </button>
    </motion.div>
  );
}
