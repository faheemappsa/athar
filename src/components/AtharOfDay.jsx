import { motion, AnimatePresence } from 'framer-motion';
import useAthar from '../hooks/useAthar';
import ShareButton from './ShareButton';

const typeLabels = {
  ayah: 'آية قرآنية',
  hadith: 'حديث شريف',
  dua: 'دعاء مأثور'
};

const typeIcons = {
  ayah: '📖',
  hadith: '🕌',
  dua: '🤲'
};

export default function AtharOfDay() {
  const { athar, loading, fromApi, refreshAthar } = useAthar();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="text-center px-6 mt-10 select-none"
    >
      <div className="text-white/40 text-xs md:text-sm font-arabic tracking-widest uppercase mb-3">
        أثر اليوم
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            className="text-white/30 text-sm font-arabic animate-pulse"
          >
            جاري تحميل الأثر...
          </motion.div>
        ) : athar ? (
          <motion.div
            key={athar.text}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-8 md:px-10 md:py-10 backdrop-blur-md shadow-lg"
          >
            <div className="text-white/50 text-sm font-arabic mb-2">
              {typeIcons[athar.type]} {typeLabels[athar.type]}
            </div>

            <div className="text-white/90 text-xl md:text-3xl font-arabic leading-loose tracking-wide mt-3 mb-4">
              {athar.text}
            </div>

            <div className="text-white/50 text-sm md:text-base font-arabic mt-2">
              {athar.reference}
            </div>

            {athar.page ? (
              <div className="text-white/30 text-xs mt-1 font-arabic">
                صفحة رقم {athar.page}
              </div>
            ) : fromApi ? (
              <div className="text-white/20 text-xs mt-1 font-arabic italic">
                من فضل الله الواسع
              </div>
            ) : null}

            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={refreshAthar}
                className="text-white/40 hover:text-white/70 text-xs font-arabic underline underline-offset-4 transition-colors duration-300"
              >
                أثر جديد
              </button>
              <ShareButton athar={athar} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            exit={{ opacity: 0 }}
            className="text-white/30 text-sm font-arabic"
          >
            تعذر تحميل الأثر
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
