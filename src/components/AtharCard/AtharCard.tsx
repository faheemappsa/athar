import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSmartAthar, type AtharContent } from "../../services/atharEngine";
import { trackEvent } from "../../utils/analytics";
import { recordAtharBehavior } from "../../experience/memory";
import { getAtharDailyFeedback, recordAtharCardTouch, type AtharDailyFeedback } from "../../experience/dailyIntelligence";
import { useSurfaceSignal } from "../../experience/useSurfaceSignal";
import { useAtharRefreshSignal } from "./useAtharRefreshSignal";

const NAME_KEY = "athar-share-name";
const NAME_SEEN_KEY = "athar-name-prompt-seen";
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

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

const getDailyAuraClass = (feedback: AtharDailyFeedback | null) => {
  if (!feedback || feedback.aura === "none") return "";
  if (feedback.aura === "complete") return "before:bg-emerald-300/24 before:shadow-[0_0_58px_rgba(56,164,124,0.26)]";
  if (feedback.aura === "attention") return "before:bg-amber-300/24 before:shadow-[0_0_62px_rgba(245,158,11,0.24)]";
  return "before:bg-action/14 before:shadow-[0_0_50px_rgba(56,164,124,0.18)]";
};

const pulse = () => {
  try {
    navigator.vibrate?.(18);
  } catch {}
};

const getShareErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === "AbortError") return "";
  if (error instanceof Error && error.message.startsWith("athar_image_api:")) {
    return `تعذر تجهيز صورة الأثر: ${error.message.replace("athar_image_api:", "")}`;
  }
  if (error instanceof Error && error.message) {
    return `تعذر تجهيز صورة الأثر: ${error.message}`;
  }
  return "تعذر تجهيز صورة الأثر. حاول مرة ثانية بعد لحظات.";
};

const getCanvasFont = (size: number, weight = 700) => `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;

const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const wrapArabicText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      return;
    }
    lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines;
};

const createClientStoryImage = async (athar: AtharContent, name: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_context_unavailable");

  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const bg = ctx.createLinearGradient(0, 0, 0, STORY_HEIGHT);
  bg.addColorStop(0, "#F9F3E8");
  bg.addColorStop(0.55, "#F7F1E6");
  bg.addColorStop(1, "#EEF3EC");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#7CA995";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(120, 500, 390, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(980, 1380, 420, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(35,76,65,0.14)";
  ctx.shadowBlur = 68;
  ctx.shadowOffsetY = 34;
  drawRoundRect(ctx, 76, 76, 928, 1758, 76);
  ctx.fillStyle = "rgba(255,253,248,0.91)";
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(47,95,80,0.08)";
  drawRoundRect(ctx, 502, 140, 76, 76, 38);
  ctx.fill();
  ctx.font = getCanvasFont(34, 600);
  ctx.fillStyle = "#547D69";
  ctx.fillText("❦", 540, 178);

  ctx.font = getCanvasFont(42, 800);
  ctx.fillStyle = "#234C41";
  ctx.fillText("أثر", 540, 260);

  ctx.font = getCanvasFont(24, 500);
  ctx.fillStyle = "rgba(35,76,65,0.58)";
  ctx.fillText("خير يبقى، وأثر لا يزول", 540, 305);

  const textLength = athar.text.length;
  const fontSize = textLength > 250 ? 46 : textLength > 190 ? 54 : textLength > 130 ? 64 : textLength > 75 ? 76 : 88;
  const lineHeight = Math.round(fontSize * 1.9);
  ctx.font = getCanvasFont(fontSize, 800);
  ctx.fillStyle = "#1F463B";
  const lines = wrapArabicText(ctx, athar.text, 820);
  const blockHeight = lines.length * lineHeight;
  let y = 850 - blockHeight / 2;
  lines.forEach((line) => {
    ctx.fillText(line, 540, y);
    y += lineHeight;
  });

  ctx.font = getCanvasFont(32, 700);
  const sourceText = athar.source || "أثر اليوم";
  const sourceWidth = Math.min(ctx.measureText(sourceText).width + 88, 760);
  const badgeX = (STORY_WIDTH - sourceWidth) / 2;
  drawRoundRect(ctx, badgeX, 1370, sourceWidth, 72, 36);
  ctx.fillStyle = "rgba(47,95,80,0.09)";
  ctx.fill();
  ctx.strokeStyle = "rgba(47,95,80,0.11)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#345F50";
  ctx.fillText(sourceText, 540, 1408);

  if (name.trim()) {
    ctx.font = getCanvasFont(25, 600);
    ctx.fillStyle = "rgba(35,76,65,0.58)";
    ctx.fillText(`بأثر من ${name.trim().slice(0, 28)}`, 540, 1494);
  }

  ctx.font = getCanvasFont(22, 500);
  ctx.fillStyle = "rgba(35,76,65,0.46)";
  ctx.fillText("athar-sandy.vercel.app", 540, 1716);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("canvas_blob_failed"));
        return;
      }
      resolve(blob);
    }, "image/png", 1);
  });
};

export default function AtharCard() {
  const [athar, setAthar] = useState<AtharContent | null>(null);
  const [shareName, setShareName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showNameActions, setShowNameActions] = useState(false);
  const [shareAfterName, setShareAfterName] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState("");
  const [dailyFeedback, setDailyFeedback] = useState<AtharDailyFeedback | null>(null);
  const [showDailyMessage, setShowDailyMessage] = useState(false);
  const refreshSignal = useAtharRefreshSignal();
  const messageTimerRef = useRef<number | null>(null);
  const surfaceSignal = useSurfaceSignal<HTMLDivElement>({ surface: "athar-card", contentId: athar?.id, minFocusMs: 4500 });

  const refreshDailyFeedback = () => {
    try {
      setDailyFeedback(getAtharDailyFeedback());
    } catch {}
  };

  useEffect(() => {
    refreshDailyFeedback();
    const handleRefresh = () => refreshDailyFeedback();
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("pageshow", handleRefresh);
    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("pageshow", handleRefresh);
      if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
    };
  }, []);

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
        refreshDailyFeedback();
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
      });

    return () => {
      mounted = false;
    };
  }, [refreshSignal]);

  const showSmartMessage = () => {
    const feedback = getAtharDailyFeedback();
    recordAtharCardTouch();
    setDailyFeedback(feedback);
    setShowDailyMessage(true);
    if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
    messageTimerRef.current = window.setTimeout(() => setShowDailyMessage(false), 2600);
    trackEvent("athar_daily_feedback", { reason: feedback.reason, high_intent: feedback.isHighIntent });
  };

  const shareBlob = async (blob: Blob) => {
    const file = new File([blob], "athar-story.png", { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "أثر", text: athar?.text || "أثر اليوم" });
      trackEvent("athar_share_success", { method: "native_share" });
      recordAtharBehavior({ type: "athar_share", surface: "athar-card", contentId: athar?.id, metadata: { method: "native_share" } });
      refreshDailyFeedback();
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "athar-story.png";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    trackEvent("athar_share_success", { method: "download" });
    recordAtharBehavior({ type: "athar_share", surface: "athar-card", contentId: athar?.id, metadata: { method: "download" } });
    refreshDailyFeedback();
  };

  const generateServerImage = async () => {
    if (!athar) throw new Error("No Athar content");

    const response = await fetch("/api/athar-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: athar.text, source: athar.source, name: shareName }),
    });

    if (!response.ok) {
      let reason = `http_${response.status}`;
      try {
        const payload = await response.json();
        if (typeof payload?.reason === "string" && payload.reason.trim()) {
          reason = payload.reason.trim();
        } else if (typeof payload?.error === "string" && payload.error.trim()) {
          reason = payload.error.trim();
        }
      } catch {
        try {
          const text = await response.text();
          if (text.trim()) reason = text.trim().slice(0, 140);
        } catch {}
      }
      throw new Error(`athar_image_api:${reason}`);
    }

    const blob = await response.blob();
    if (!blob.type.includes("image/png") || blob.size < 1024) {
      throw new Error(`invalid_story_image_${blob.type || "unknown"}_${blob.size}`);
    }

    return blob;
  };

  const shareImage = async () => {
    if (!athar || isSharing) return;
    setIsSharing(true);
    setShareError("");
    trackEvent("athar_share_start", { kind: athar.kind, time: athar.time });

    try {
      const blob = await generateServerImage().catch(async (serverError) => {
        trackEvent("athar_share_canvas_fallback", { reason: serverError instanceof Error ? serverError.message : "unknown" });
        return createClientStoryImage(athar, shareName);
      });
      await shareBlob(blob);
    } catch (error) {
      const message = getShareErrorMessage(error);
      if (message) setShareError(message);
      trackEvent("athar_share_error", { reason: error instanceof Error ? error.message : "unknown" });
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
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }} className="w-full rounded-card bg-white p-6 text-center text-secondary-text shadow-xl">
        جاري التحميل...
      </motion.div>
    );
  }

  const mood = getCardMood(athar.time);
  const auraClass = getDailyAuraClass(dailyFeedback);

  return (
    <motion.div ref={surfaceSignal.ref} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }} className={`relative w-full overflow-hidden rounded-card bg-white p-4 text-center shadow-xl transition-all duration-300 before:pointer-events-none before:absolute before:inset-2 before:-z-10 before:rounded-[34px] before:blur-2xl hover:-translate-y-1 hover:shadow-2xl ${mood.aura} ${auraClass}`}>
      <motion.div onClick={showSmartMessage} initial={{ opacity: 0.96, scale: 0.992 }} animate={{ opacity: 1, scale: [1, 1.006, 1] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className={`relative min-h-[430px] w-full cursor-pointer overflow-hidden rounded-[32px] bg-gradient-to-br ${mood.shell} px-7 py-9 shadow-inner ring-1 ${mood.ring}`}>
        <motion.div animate={{ opacity: [0.5, 0.82, 0.5], scale: [1, 1.08, 1] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }} className={`absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full blur-3xl ${mood.glow}`} />
        <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.52),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.22),transparent_38%)]" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-action/8" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-action/5" />
        <div className="absolute inset-x-8 top-10 h-44 rounded-b-[96px] border-x border-b border-action/5" />

        <motion.div key={athar.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, ease: "easeOut" }} className="relative z-10 flex min-h-[352px] flex-col items-center justify-between">
          <p className="text-sm font-bold tracking-wide text-action/80">أثر اليوم</p>

          <div className="flex flex-1 items-center justify-center py-9">
            <p className="break-words text-[1.72rem] font-extrabold leading-[2.35] text-primary-text">{athar.text}</p>
          </div>

          <div className="w-full space-y-3">
            <p className="text-sm font-semibold text-secondary-text/80">{athar.source}</p>
            {shareName && (
              <div className="flex w-full justify-start">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
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

      <AnimatePresence>
        {showDailyMessage && dailyFeedback && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-4 rounded-2xl border border-action/12 bg-primary-bg px-4 py-3 text-sm font-extrabold text-primary-text shadow-sm">
            {dailyFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={handleShare} disabled={isSharing} className="mt-5 w-full rounded-full bg-action px-6 py-4 text-lg font-bold text-white shadow-lg shadow-action/20 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-75">
        {isSharing ? "جاري تجهيز صورة الأثر..." : "شارك الأثر"}
      </button>

      <AnimatePresence>
        {shareError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-relaxed text-red-600">
            {shareError}
          </motion.div>
        )}
      </AnimatePresence>

      {(showNamePrompt || showNameActions) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/25 px-4 pb-8 pt-[18vh] backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.22 }} className="w-full max-w-md rounded-[30px] bg-white p-5 text-center shadow-2xl">
            <p className="text-xl font-extrabold text-primary-text">{showNameActions ? "تعديل اسمك" : "تحب نكتب اسمك على بطاقة الأثر؟"}</p>
            <p className="mt-2 text-sm leading-relaxed text-secondary-text">{showNameActions ? "عدّل الاسم أو احذفه من بطاقة أثر." : "اكتب اسمك أو لقبك مرة واحدة، ونحفظه لك بهدوء."}</p>
            <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={28} placeholder="اسمك أو لقبك" className="mt-5 w-full rounded-2xl border border-action/15 bg-primary-bg px-4 py-4 text-center text-lg font-bold text-primary-text outline-none focus:border-action" />
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
