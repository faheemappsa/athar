import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { trackEvent } from "../../utils/analytics";

const items = [
  { to: "/quran", label: "المصحف", icon: "📖", event: "nav_quran" },
  { to: "/", label: "الرئيسية", icon: "⌂", event: "nav_home" },
  { to: "/dhikr", label: "الأذكار", icon: "📿", event: "nav_dhikr" },
];

const getIndicatorPosition = (pathname: string) => {
  if (pathname === "/quran") return "left-[83.33%]";
  if (pathname === "/dhikr") return "left-[16.66%]";
  return "left-1/2";
};

export default function BottomNav() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const isFocusMode = focusPath === location.pathname;
  const collapsed = isCollapsed || isFocusMode;

  useEffect(() => {
    const handleFocusMode = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string; active?: boolean }>).detail;
      if (!detail?.path) return;
      setFocusPath(detail.active ? detail.path : null);
    };

    window.addEventListener("athar-focus-mode", handleFocusMode);
    return () => window.removeEventListener("athar-focus-mode", handleFocusMode);
  }, []);

  useEffect(() => {
    setFocusPath(null);
  }, [location.pathname]);

  useEffect(() => {
    const scrollElement = document.getElementById("app-scroll");
    if (!scrollElement) return;

    let lastScrollTop = scrollElement.scrollTop;
    let expandTimer: ReturnType<typeof window.setTimeout> | undefined;

    const handleScroll = () => {
      const currentScrollTop = scrollElement.scrollTop;
      const isScrollingDown = currentScrollTop > lastScrollTop && currentScrollTop > 24;
      const isScrollingUp = currentScrollTop < lastScrollTop;
      const isNearTop = currentScrollTop < 12;

      if (expandTimer) window.clearTimeout(expandTimer);

      if (isScrollingDown && !isNearTop) {
        setIsCollapsed(true);
      }

      if (isScrollingUp || isNearTop) {
        setIsCollapsed(false);
      } else {
        expandTimer = window.setTimeout(() => setIsCollapsed(false), 900);
      }

      lastScrollTop = currentScrollTop;
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (expandTimer) window.clearTimeout(expandTimer);
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const expandTemporarily = () => {
    if (!collapsed) return;
    setFocusPath(null);
    setIsCollapsed(false);
  };

  return (
    <nav
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 transition-all duration-300 ${
        isFocusMode ? "right-5 left-auto w-[72px]" : "inset-x-6 mx-auto max-w-[340px]"
      }`}
    >
      <div
        onClick={expandTemporarily}
        className={`relative overflow-hidden rounded-full border border-white/60 bg-white/70 shadow-xl shadow-black/5 ring-1 ring-action/10 backdrop-blur-2xl transition-all duration-300 supports-[backdrop-filter]:bg-white/55 ${
          collapsed ? "h-[58px] max-w-[250px] mx-auto" : "h-[72px] max-w-[340px]"
        } ${isFocusMode ? "w-[72px] cursor-pointer" : "w-full"}`}
      >
        <div
          className={`absolute -translate-x-1/2 rounded-full bg-action/90 ring-1 ring-white/40 transition-all duration-300 ease-out ${
            collapsed ? "bottom-1.5 h-11 w-16" : "bottom-2 h-14 w-24"
          } ${isFocusMode ? "left-1/2" : getIndicatorPosition(location.pathname)}`}
        />
        <div className="relative z-10 grid h-full grid-cols-3 items-center px-2">
          {items.map((item) => {
            const isHiddenByFocus = isFocusMode && item.to !== location.pathname;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => trackEvent(item.event, { from: location.pathname, to: item.to })}
                className={({ isActive }) =>
                  `flex h-full flex-col items-center justify-center rounded-full font-bold transition-all duration-300 ${
                    isActive ? "text-white" : "text-secondary-text"
                  } ${collapsed ? "gap-0 text-lg" : "gap-1 text-sm"} ${isHiddenByFocus ? "pointer-events-none scale-75 opacity-0" : "opacity-100"}`
                }
              >
                <span
                  aria-hidden={!collapsed}
                  className={`relative z-10 leading-none transition-all duration-300 ${
                    collapsed ? "max-h-6 scale-110 opacity-100" : "max-h-0 scale-75 opacity-0"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`relative z-10 whitespace-nowrap leading-none transition-all duration-300 ${
                    collapsed ? "max-h-0 scale-90 opacity-0" : "max-h-4 scale-100 opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
