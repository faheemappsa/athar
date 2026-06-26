import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { appMotion } from "../../config/motion";

export default function PageTransition({ children }: { children: ReactNode }) {
  const page = appMotion.page;

  return (
    <motion.div
      className="w-full"
      initial={page.initial}
      animate={page.animate}
      exit={page.exit}
      transition={page.transition}
    >
      {children}
    </motion.div>
  );
}
