import { motion } from "framer-motion";
import type { DhikrCategory } from "../../data/adhkar";
import {
  DHIKR_COMPLETION_VERSE,
  DHIKR_COMPLETION_VERSE_SOURCE,
  getDhikrCompletionMessage,
} from "../../utils/dhikrCompletion";

type DhikrCompletionCardProps = {
  category: DhikrCategory;
  identityCopy: string;
  completionCount: number;
};

export default function DhikrCompletionCard({ category, identityCopy, completionCount }: DhikrCompletionCardProps) {
  const completionMessage = getDhikrCompletionMessage(category, completionCount);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mt-4 overflow-hidden rounded-[30px] border border-action/10 bg-mint-soft p-5 text-center shadow-inner shadow-white/50"
      aria-label="بطاقة إتمام الأذكار"
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/80 text-3xl shadow-sm" aria-hidden="true">🌿</div>
      <p className="mt-3 text-lg font-extrabold leading-relaxed text-primary-text">{DHIKR_COMPLETION_VERSE}</p>
      <p className="mt-1 text-xs font-bold text-action">{DHIKR_COMPLETION_VERSE_SOURCE}</p>
      <p className="mt-4 text-sm font-extrabold text-primary-text">{identityCopy}</p>
      <p className="mt-2 text-sm leading-relaxed text-secondary-text">{completionMessage}</p>
    </motion.section>
  );
}
