import { useEffect, useRef } from "react";
import type { AtharSurface } from "./types";
import { recordAtharBehavior } from "./memory";

type SurfaceSignalOptions = {
  surface: AtharSurface;
  contentId?: string;
  focusThresholdMs?: number;
};

export const useSurfaceSignals = <TElement extends HTMLElement>({
  surface,
  contentId,
  focusThresholdMs = 3500,
}: SurfaceSignalOptions) => {
  const ref = useRef<TElement | null>(null);
  const visibleSinceRef = useRef<number | null>(null);
  const hasViewedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const now = Date.now();
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.58;

        if (isVisible) {
          visibleSinceRef.current = now;
          if (!hasViewedRef.current) {
            hasViewedRef.current = true;
            recordAtharBehavior({ type: surface === "prayer-card" ? "prayer_view" : "surface_view", surface, contentId });
          }
          return;
        }

        if (visibleSinceRef.current) {
          const durationMs = now - visibleSinceRef.current;
          if (durationMs >= focusThresholdMs) {
            recordAtharBehavior({ type: "surface_focus", surface, durationMs, contentId });
          }
          visibleSinceRef.current = null;
        }
      },
      { threshold: [0, 0.58, 0.85] },
    );

    observer.observe(node);

    return () => {
      const now = Date.now();
      if (visibleSinceRef.current) {
        const durationMs = now - visibleSinceRef.current;
        if (durationMs >= focusThresholdMs) {
          recordAtharBehavior({ type: "surface_focus", surface, durationMs, contentId });
        }
      }
      observer.disconnect();
    };
  }, [contentId, focusThresholdMs, surface]);

  const recordClick = (metadata?: Record<string, string | number | boolean | null>) => {
    recordAtharBehavior({ type: "surface_click", surface, contentId, metadata });
  };

  return { ref, recordClick };
};
