import { useRef, useState } from "react";
import { motion } from "framer-motion";

const RADIO_STREAM_URL = "https://aloula.sba.sa/live/nidaalislamadio";

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(RADIO_STREAM_URL);
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex w-full items-center justify-between gap-3 rounded-card bg-white p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="min-w-0">
        <p className="text-xs text-secondary-text">إذاعة مباشرة</p>
        <p className="truncate text-base font-semibold text-primary-text">📻 نداء الإسلام</p>
      </div>
      <button
        onClick={togglePlay}
        className="shrink-0 rounded-full bg-action px-5 py-2 text-base font-semibold text-white shadow-md transition hover:opacity-90"
      >
        {isPlaying ? "إيقاف" : "تشغيل"}
      </button>
    </motion.div>
  );
}
