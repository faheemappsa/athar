export const appMotion = {
  page: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  surface: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: 0.2, ease: 'easeOut' },
  },
  completionCard: {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.45, ease: 'easeOut' },
  },
  tap: {
    scale: 0.97,
    brightness: 0.98,
    durationMs: 140,
  },
} as const;
