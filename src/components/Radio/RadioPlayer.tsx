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
      className="bg-white rounded-card shadow-xl p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-between"
    >
      <span className="text-primary-text text-lg font-semibold">📻 نداء الإسلام</span>
      <button
        onClick={togglePlay}
        className="bg-action text-white px-6 py-2 rounded-full text-lg font-semibold shadow-md hover:opacity-90 transition"
      >
        {isPlaying ? "إيقاف" : "تشغيل"}
      </button>
    </motion.div>
  );
}
