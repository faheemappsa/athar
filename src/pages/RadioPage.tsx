import { motion } from "framer-motion";

const RADIO_PAGE_URL = "https://aloula.sba.sa/ar/live/nidaalislamadio";

export default function RadioPage() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-card bg-white p-3 shadow-xl"
      >
        <div className="overflow-hidden rounded-[28px] bg-primary-bg">
          <iframe
            src={RADIO_PAGE_URL}
            title="بث مباشر - قناة نداء الإسلام"
            className="h-[560px] w-full border-0"
            allow="autoplay; encrypted-media"
            loading="lazy"
          />
        </div>
      </motion.div>

      <a
        href={RADIO_PAGE_URL}
        target="_blank"
        rel="noreferrer"
        className="block rounded-full bg-action px-6 py-4 text-center text-lg font-bold text-white shadow-lg shadow-action/20"
      >
        فتح المشغل الرسمي
      </a>
    </div>
  );
}
