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
    success: { scale: [1, 0.965, 1.018, 1] },
    complete: { scale: [1, 1.045, 1] },
    idle: { scale: 1 },
    successTransition: { duration: 0.26, ease: 'easeOut' },
    completeTransition: { duration: 0.58, ease: 'easeOut' },
  },
  dhikrPulse: {
    initial: { opacity: 0.5, scale: 0.72 },
    animate: { opacity: 0, scale: 1.34 },
    transition: { duration: 0.46, ease: 'easeOut' },
  },
  dhikrCompleteGlow: {
    initial: { opacity: 0, scale: 0.72 },
    animate: { opacity: [0, 0.62, 0], scale: [0.72, 1.18, 1.46] },
    transition: { duration: 0.9, ease: 'easeOut' },
  },
  tap: {
    scale: 0.97,
    brightness: 0.98,
    durationMs: 140,
  },
} as const;
