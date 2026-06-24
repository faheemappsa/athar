import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getSmartAthar, type AtharContent } from "../../services/atharEngine";
import html2canvas from "html2canvas";

const NAME_KEY = "athar-share-name";
const NAME_SEEN_KEY = "athar-name-prompt-seen";

const getCardMood = (time: AtharContent["time"]) => {
  if (time === "morning") {
    return {
      shell: "from-white via-[#F8FFF9] to-[#EAF7EF]",
      glow: "bg-[#CBEFD8]/35",
      ring: "ring-[#BFEAD0]/45",
      aura: "shadow-[#8FD3B3]/25",
    };
  }

  if (time === "night") {
    return {
      shell: "from-white via-[#F4FBF8] to-[#E2F0EA]",
      glow: "bg-[#7FC7A7]/22",
      ring: "ring-[#7FC7A7]/30",
      aura: "shadow-[#5EAA8C]/20",
    };
  }

  if (time === "pressure") {
    return {
      shell: "from-white via-[#F8FBF8] to-[#ECF5F0]",
      glow: "bg-[#A9DCC4]/24",
      ring: "ring-[#A9DCC4]/34",
      aura: "shadow-[#86C6AA]/20",
    };
  }

  return {
    shell: "from-white via-[#F8FFFD] to-[#EAF6F3]",
    glow: "bg-[#B8E3CF]/26",
    ring: "ring-[#B8E3CF]/36",
    aura: "shadow-[#8FD3B3]/18",
  };
};

const pulse = () => {
  try {
    navigator.vibrate?.(18);
  } catch {}
};

export default function AtharCard() {
  const [athar, setAthar] = useState<AtharContent | null>(null);
  const [shareName, setShareName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showNameActions, setShowNameActions] = useState(false);
  const [shareAfterName, setShareAfterName] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    try {
      const savedName = localStorage.getItem(NAME_KEY) || "";
      setShareName(savedName);
      setNameDraft(savedName);
    } catch {}

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

  const shareImage = async () => {
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

  const handleShare = async () => {
    pulse();
    const hasSeenPrompt = localStorage.getItem(NAME_SEEN_KEY) === "1";
    if (!hasSeenPrompt) {
      setShareAfterName(true);
      setShowNamePrompt(true);
      return;
    }
    await shareImage();
  };

  const saveName = async () => {
    const cleanName = nameDraft.trim().slice(0, 28);
    localStorage.setItem(NAME_SEEN_KEY, "1");
    if (cleanName) {
      localStorage.setItem(NAME_KEY, cleanName);
      setShareName(cleanName);
      setNameDraft(cleanName);
    }
    setShowNamePrompt(false);
    setShowNameActions(false);
    if (shareAfterName) {
      setShareAfterName(false);
      setTimeout(() => void shareImage(), 120);
    }
  };

  const skipName = async () => {
    localStorage.setItem(NAME_SEEN_KEY, "1");
    setShowNamePrompt(false);
    setShowNameActions(false);
    if (shareAfterName) {
      setShareAfterName(false);
      setTimeout(() => void shareImage(), 120);
    }
  };

  const deleteName = () => {
    localStorage.removeItem(NAME_KEY);
    setShareName("");
    setNameDraft("");
    setShowNameActions(false);
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
      className={`w-full overflow-hidden rounded-card bg-white p-4 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${mood.aura}`}
    >
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0.96, scale: 0.992 }}
        animate={{ opacity: 1, scale: [1, 1.006, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className={`relative min-h-[430px] w-full overflow-hidden rounded-[32px] bg-gradient-to-br ${mood.shell} px-7 py-9 shadow-inner ring-1 ${mood.ring}`}
      >
        <motion.div
          animate={{ opacity: [0.5, 0.82, 0.5], scale: [1, 1.08, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full blur-3xl ${mood.glow}`}
        />
        <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.52),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent_38%)]" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-action/8" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-action/5" />
        <div className="absolute inset-x-8 top-10 h-44 rounded-b-[96px] border-x border-b border-action/5" />

        <motion.div
          key={athar.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
          className="relative z-10 flex min-h-[352px] flex-col items-center justify-between"
        >
          <p className="text-sm font-bold tracking-wide text-action/80">أثر اليوم</p>

          <div className="flex flex-1 items-center justify-center py-9">
            <p className="break-words text-[1.72rem] font-extrabold leading-[2.35] text-primary-text">
              {athar.text}
            </p>
          </div>

          <div className="w-full space-y-3">
            <p className="text-sm font-semibold text-secondary-text/80">{athar.source}</p>
            {shareName && (
              <div className="flex w-full justify-start">
                <button
                  type="button"
                  onClick={() => {
                    pulse();
                    setNameDraft(shareName);
                    setShowNameActions(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2.5 text-sm font-extrabold text-action shadow-md shadow-action/5 backdrop-blur active:scale-[0.97]"
                >
                  <span className="text-base leading-none">✦</span>
                  <span>{shareName}</span>
                  <span className="text-base leading-none opacity-80">✎</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      <button
        onClick={handleShare}
        className="mt-5 w-full rounded-full bg-action px-6 py-4 text-lg font-bold text-white shadow-lg shadow-action/20 transition hover:opacity-90 active:scale-[0.98]"
      >
        شارك الأثر
      </button>

      {(showNamePrompt || showNameActions) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/25 px-4 pb-8 pt-[18vh] backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-md rounded-[30px] bg-white p-5 text-center shadow-2xl"
          >
            <p className="text-xl font-extrabold text-primary-text">
              {showNameActions ? "تعديل اسمك" : "تحب نكتب اسمك على بطاقة الأثر؟"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-secondary-text">
              {showNameActions ? "عدّل الاسم أو احذفه من بطاقة أثر." : "اكتب اسمك أو لقبك مرة واحدة، ونحفظه لك بهدوء."}
            </p>
            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              maxLength={28}
              placeholder="اسمك أو لقبك"
              className="mt-5 w-full rounded-2xl border border-action/15 bg-primary-bg px-4 py-4 text-center text-lg font-bold text-primary-text outline-none focus:border-action"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={saveName} className="rounded-full bg-action px-5 py-3 font-bold text-white shadow-lg shadow-action/20">
                متابعة
              </button>
              <button onClick={skipName} className="rounded-full bg-primary-bg px-5 py-3 font-bold text-secondary-text">
                تخطي
              </button>
            </div>
            {showNameActions && (
              <button onClick={deleteName} className="mt-3 w-full rounded-full bg-red-50 px-5 py-3 font-bold text-red-500">
                حذف الاسم
              </button>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
