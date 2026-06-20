import { motion } from 'framer-motion';

export default function ShareButton({ athar }) {
  if (!athar) return null;

  const handleShare = async () => {
    const text = `${athar.text}

${athar.reference}${athar.page ? ' - صفحة ' + athar.page : ''}

من موقع أثر - وقف عن مسلم عوده البويني رحمه الله
https://athar-sandy.vercel.app`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // تجاهل
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('تم نسخ الأثر! شاركه مع من تحب.');
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleShare}
      className="text-white/40 hover:text-white/70 text-xs font-arabic underline underline-offset-4 transition-colors duration-300"
    >
      شارك الأثر
    </motion.button>
  );
}
