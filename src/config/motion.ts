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
  dhikrCounter: {
    success: { scale: [1, 0.975, 1.012, 1] },
    complete: { scale: [1, 1.035, 1] },
    idle: { scale: 1 },
    successTransition: { duration: 0.22, ease: 'easeOut' },
    completeTransition: { duration: 0.55, ease: 'easeOut' },
  },
  dhikrPulse: {
    initial: { opacity: 0.42, scale: 0.78 },
    animate: { opacity: 0, scale: 1.28 },
    transition: { duration: 0.42, ease: 'easeOut' },
  },
  tap: {
    scale: 0.97,
    brightness: 0.98,
    durationMs: 140,
  },
} as const;
