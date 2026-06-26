export const appMotion = {
  page: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  tap: {
    scale: 0.97,
    brightness: 0.98,
    durationMs: 140,
  },
} as const;
