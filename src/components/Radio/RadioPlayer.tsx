import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const RADIO_STREAM_URL = "https://www.aloula.sa/live/nidaalislam/playlist.m3u8";
const FALLBACK_STREAM_URL = "https://aloula.sba.sa/live/nidaalislamadio";

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.crossOrigin = "anonymous";
    audio.src = RADIO_STREAM_URL;

    const handlePlaying = () => {
      setIsPlaying(true);
      setStatus("playing");
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (status !== "error") setStatus("idle");
    };
    const handleError = () => {
      if (audio.src !== FALLBACK_STREAM_URL) {
        audio.src = FALLBACK_STREAM_URL;
        audio.load();
        return;
      }
      setIsPlaying(false);
      setStatus("error");
    };

    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audioRef.current = null;
    };
  }, [status]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setStatus("idle");
      return;
    }

    try {
      setStatus("loading");
      audio.src = RADIO_STREAM_URL;
      audio.load();
      await audio.play();
    } catch {
      try {
        audio.src = FALLBACK_STREAM_URL;
        audio.load();
        await audio.play();
      } catch {
        setStatus("error");
        setIsPlaying(false);
      }
    }
  };

  const statusText =
    status === "loading" ? "جاري الاتصال بالبث" : status === "playing" ? "القناة تعمل الآن" : status === "error" ? "تعذر تشغيل البث" : "إذاعة مباشرة";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex w-full items-center justify-between gap-3 rounded-card bg-white p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="min-w-0">
        <p className="text-xs text-secondary-text">{statusText}</p>
        <p className="truncate text-base font-semibold text-primary-text">📻 نداء الإسلام</p>
      </div>
      <button
        onClick={togglePlay}
        disabled={status === "loading"}
        className="shrink-0 rounded-full bg-action px-5 py-2 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-70"
      >
        {status === "loading" ? "..." : isPlaying ? "إيقاف" : "تشغيل"}
      </button>
    </motion.div>
  );
}
