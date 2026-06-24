import { motion } from "framer-motion";

const MUSHAF_PDF_URL = "https://qurancomplex.gov.sa/wp-content/uploads/isdarat/hafs/mumtaz-1.pdf";

export default function Quran() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full overflow-hidden rounded-card bg-white p-2 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative overflow-hidden rounded-[28px] bg-[#FBF7EC] p-1.5 shadow-inner">
        <iframe
          title="المصحف الشريف"
          src={MUSHAF_PDF_URL}
          className="h-[82vh] min-h-[680px] w-full rounded-[24px] border-0 bg-white shadow-sm"
          loading="lazy"
        />
      </div>
    </motion.div>
  );
}
