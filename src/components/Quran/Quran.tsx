import { motion } from "framer-motion";

const MUSHAF_PDF_URL = "https://qurancomplex.gov.sa/wp-content/uploads/isdarat/hafs/mumtaz-1.pdf";

export default function Quran() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full overflow-hidden rounded-card bg-white p-4 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-bold text-primary-text">المصحف</h2>
          <p className="mt-0.5 text-xs text-secondary-text">مصحف المدينة من مجمع الملك فهد</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-bg px-3 py-1.5 text-xs font-bold text-secondary-text">نسخة كاملة</span>
      </div>

      <div className="mb-3 rounded-[24px] bg-primary-bg/70 p-3 text-center">
        <p className="text-sm font-semibold leading-7 text-primary-text">
          قراءة واضحة وهادئة داخل أثر، بدون مغادرة التطبيق.
        </p>
        <p className="mt-1 text-xs font-medium text-secondary-text">
          يحتاج اتصالًا بالإنترنت عند الفتح من المصدر الرسمي.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[26px] bg-[#FBF7EC] p-2 shadow-inner">
        <iframe
          title="المصحف الشريف"
          src={`${MUSHAF_PDF_URL}#view=FitH`}
          className="h-[72vh] min-h-[560px] w-full rounded-[22px] border-0 bg-white shadow-sm"
          loading="lazy"
        />
      </div>
    </motion.div>
  );
}
