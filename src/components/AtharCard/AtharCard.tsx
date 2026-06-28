import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getSmartAthar, type AtharContent } from "../../services/atharEngine";
import html2canvas from "html2canvas";
import { trackEvent } from "../../utils/analytics";
import { recordAtharBehavior } from "../../experience/memory";
import { recordContentShown } from "../../experience/recordContentShown";
import { useSurfaceSignal } from "../../experience/useSurfaceSignal";

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
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const surfaceSignal = useSurfaceSignal<HTMLDivElement>({ surface: "athar-card", contentId: athar?.id, minFocusMs: 4500 });

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
        recordContentShown(content.id);
        localStorage.setItem("athar-content", JSON.stringify(content));
        localStorage.setItem("athar-last-shown", String(Date.now()));
        trackEvent("athar_content_view", { kind: content.kind, time: content.time });
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
        recordContentShown(fallback.id);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const shareBlob = async (blob: Blob) => {
    const file = new File([blob], "athar-story.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "أثر",
        text: athar?.text || "أثر اليوم",
      });
      trackEvent("athar_share_success", { method: "native_share" });
      recordAtharBehavior({ type: "athar_share", surface: "athar-card", contentId: athar?.id, metadata: { method: "native_share" } });
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "athar-story.png";
    link.click();
    URL.revokeObjectURL(url);
    trackEvent("athar_share_success", { method: "download" });
    recordAtharBehavior({ type: "athar_share", surface: "athar-card", contentId: athar?.id, metadata: { method: "download" } });
  };

  const generateServerImage = async () => {
    if (!athar) throw new Error("No Athar content");
    const response = await fetch("/api/athar-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: athar.text,
        source: athar.source,
        name: shareName,
      }),
    });

    if (!response.ok) throw new Error("Server image failed");
    return response.blob();
  };

  const generateFallbackImage = async () => {
    if (!cardRef.current) throw new Error("No card element");
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#F8FFFD" });
    const image = canvas.toDataURL("image/png");
    return fetch(image).then((res) => res.blob());
  };

  const shareImage = async () => {
    if (!athar || isSharing) return;
    setIsSharing(true);
    trackEvent("athar_share_start", { kind: athar.kind, time: athar.time });
    try {
      const blob = await generateServerImage().catch(() => generateFallbackImage());
      await shareBlob(blob);
    } catch {
      trackEvent("athar_share_error");
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = async () => {
    pulse();
    surfaceSignal.recordClick();
    const hasSeenPrompt = localStorage.getItem(NAME_SEEN_KEY) === "1";
    if (!hasSeenPrompt) {
      setShareAfterName(true);
      setShowNamePrompt(true);
      trackEvent("athar_name_prompt_view");
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
      trackEvent("athar_name_saved");
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
    trackEvent("athar_name_skipped");
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
    trackEvent("athar_name_deleted");
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
      ref={surfaceSignal.ref}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${mood.shell} p-4 shadow-2xl ${mood.aura} ring-1 ${mood.ring}`}
    >
      <div className={`pointer-events-none absolute -top-20 left-8 h-44 w-44 rounded-full ${mood.glow} blur-3xl`} />
      <div className="relative rounded-[1.6rem] border border-white/70 bg-white/72 p-5 backdrop-blur-md" ref={cardRef}>
        <div className="mb-4 flex items-center justify-between text-xs text-secondary-text">
          <span>أثر اليوم</span>
          <span>وقف رقمي</span>
        </div>
        <p className="whitespace-pre-line text-center text-2xl font-bold leading-[2.2] text-primary-text">{athar.text}</p>
        <p className="mt-4 text-center text-sm text-secondary-text">{athar.source}</p>
        {shareName && <p className="mt-4 text-center text-xs text-secondary-text">إهداء من {shareName}</p>}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
        >
          {isSharing ? "جاري تجهيز الأثر..." : "مشاركة الأثر"}
        </button>
        <button
          type="button"
          onClick={() => setShowNameActions(true)}
          className="rounded-full bg-white/75 px-4 py-3 text-sm font-bold text-primary-text shadow-sm"
        >
          الاسم
        </button>
      </div>

      {showNamePrompt && (
        <div className="mt-4 rounded-[1.5rem] bg-white/82 p-4 shadow-inner">
          <p className="text-sm font-bold text-primary-text">أضف اسمك على بطاقة الأثر</p>
          <input
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            maxLength={28}
            className="mt-3 w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 text-right text-sm outline-none focus:border-primary"
            placeholder="اكتب اسمك"
          />
          <div className="mt-3 flex gap-2">
            <button onClick={saveName} className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">
              حفظ ومتابعة
            </button>
            <button onClick={skipName} className="rounded-full bg-soft px-4 py-2 text-sm font-bold text-primary-text">
              تخطي
            </button>
          </div>
        </div>
      )}

      {showNameActions && !showNamePrompt && (
        <div className="mt-4 rounded-[1.5rem] bg-white/82 p-4 shadow-inner">
          <input
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            maxLength={28}
            className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 text-right text-sm outline-none focus:border-primary"
            placeholder="اكتب اسمك"
          />
          <div className="mt-3 flex gap-2">
            <button onClick={saveName} className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">
              حفظ
            </button>
            <button onClick={deleteName} className="rounded-full bg-soft px-4 py-2 text-sm font-bold text-primary-text">
              حذف
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
