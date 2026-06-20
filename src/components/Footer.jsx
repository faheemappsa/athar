import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1.2 }}
      className="text-center mt-12 mb-8 select-none"
    >
      <div className="text-white/50 text-sm md:text-base font-arabic tracking-wider leading-loose">
        أثر جارٍ لا ينقطع
      </div>
      <div className="text-white/30 text-xs md:text-sm font-arabic mt-1">
        وقف عن مسلم عوده البويني رحمه الله
      </div>
      <div className="w-10 h-px bg-white/10 mx-auto mt-4" />
    </motion.div>
  );
}
