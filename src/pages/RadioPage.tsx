import { motion } from "framer-motion";

const RADIO_PAGE_URL = "https://radioplus.sba.sa/ar/live/1";

export default function RadioPage() {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-card bg-action p-5 text-white shadow-xl"
      >
        <div className="relative z-10">
          <p className="text-sm text-white/75">المشغل الرسمي</p>
          <h2 className="mt-1 text-2xl font-bold">📻 إذاعة نداء الإسلام</h2>
          <p className="mt-2 text-sm text-white/80">اضغط تشغيل من داخل نافذة الإذاعة.</p>
        </div>
        <div className="absolute -bottom-10 left-0 h-20 w-2/3 rounded-tr-[90px] bg-white/20" />
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
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
