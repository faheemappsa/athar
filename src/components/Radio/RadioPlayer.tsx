import { motion } from "framer-motion";

const RADIO_PAGE_URL = "https://radioplus.sba.sa/ar/live/1";

export default function RadioPlayer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex w-full items-center justify-between gap-3 rounded-card bg-white p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="min-w-0">
        <p className="text-xs text-secondary-text">المشغل الرسمي</p>
        <p className="truncate text-base font-semibold text-primary-text">📻 نداء الإسلام</p>
      </div>
      <a
        href={RADIO_PAGE_URL}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-full bg-action px-5 py-2 text-base font-semibold text-white shadow-md transition hover:opacity-90"
      >
        تشغيل
      </a>
    </motion.div>
  );
}
