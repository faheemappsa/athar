import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "athar-scroll-positions";

const readPositions = (): Record<string, number> => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const savePosition = (path: string, top: number) => {
  try {
    const positions = readPositions();
    positions[path] = top;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {}
};

export default function ScrollMemory({ targetId = "app-scroll" }: { targetId?: string }) {
  const location = useLocation();

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const positions = readPositions();
    const savedTop = positions[location.pathname];

    requestAnimationFrame(() => {
      el.scrollTo({ top: typeof savedTop === "number" ? savedTop : 0, behavior: "auto" });
    });

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        savePosition(location.pathname, el.scrollTop);
        ticking = false;
      });
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      savePosition(location.pathname, el.scrollTop);
      el.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname, targetId]);

  return null;
}
