import { useEffect, useRef } from "react";
import type { AtharSurface } from "./types";
import { recordAtharBehavior } from "./memory";

type SurfaceSignalOptions = {
  surface: AtharSurface;
  contentId?: string;
  minFocusMs?: number;
  threshold?: number;
};

export const useSurfaceSignal = <TElement extends HTMLElement>({
  surface,
  contentId,
  minFocusMs = 3500,
  threshold = 0.58,
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
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          visibleSinceRef.current = visibleSinceRef.current || now;
          if (!hasViewedRef.current) {
            hasViewedRef.current = true;
            recordAtharBehavior({ type: surface === "prayer-card" ? "prayer_view" : "surface_view", surface, contentId });
          }
          return;
        }

        if (visibleSinceRef.current) {
          const durationMs = now - visibleSinceRef.current;
          visibleSinceRef.current = null;
          if (durationMs >= minFocusMs) {
            recordAtharBehavior({ type: "surface_focus", surface, durationMs, contentId });
          }
        }
      },
      { threshold: [0, threshold, 0.8, 1] },
    );

    observer.observe(node);

    return () => {
      const now = Date.now();
      if (visibleSinceRef.current) {
        const durationMs = now - visibleSinceRef.current;
        if (durationMs >= minFocusMs) {
          recordAtharBehavior({ type: "surface_focus", surface, durationMs, contentId });
        }
      }
      observer.disconnect();
    };
  }, [contentId, minFocusMs, surface, threshold]);

  const recordClick = () => recordAtharBehavior({ type: "surface_click", surface, contentId });

  return { ref, recordClick };
};
