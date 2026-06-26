import { useEffect, useMemo, useState } from "react";
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
  const activeItem = useMemo(() => items.find((item) => item.to === location.pathname) || items[1], [location.pathname]);

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

    const handleScroll = () => {
      const currentScrollTop = scrollElement.scrollTop;
      const isScrollingDown = currentScrollTop > lastScrollTop && currentScrollTop > 24;
      const isScrollingUp = currentScrollTop < lastScrollTop;
      const isNearTop = currentScrollTop < 12;

      if (isScrollingDown && !isNearTop) {
        setIsCollapsed(true);
      }

      if (isScrollingUp || isNearTop) {
        setIsCollapsed(false);
      }

      lastScrollTop = currentScrollTop;
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  const expandTemporarily = () => {
    if (!collapsed) return;
    setFocusPath(null);
    setIsCollapsed(false);
  };

  return (
    <nav
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 transition-all duration-500 ease-out ${
        collapsed ? "left-5 right-auto w-[64px]" : "inset-x-6 mx-auto max-w-[340px]"
      }`}
    >
      <div
        onClick={expandTemporarily}
        className={`relative overflow-hidden border border-white/50 bg-white/35 shadow-[0_18px_45px_rgba(30,27,24,0.14)] ring-1 ring-white/40 backdrop-blur-3xl transition-all duration-500 ease-out supports-[backdrop-filter]:bg-white/25 ${
          collapsed ? "h-[58px] w-[64px] cursor-pointer rounded-[26px]" : "h-[70px] w-full rounded-[34px]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-white/20 to-white/10" />
        <div className="pointer-events-none absolute inset-x-3 top-1 h-px bg-white/70" />
        <div
          className={`absolute rounded-full bg-action/90 shadow-lg shadow-action/20 ring-1 ring-white/60 transition-all duration-500 ease-out ${
            collapsed ? "left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2" : `bottom-2 h-14 w-[30%] -translate-x-1/2 ${getIndicatorPosition(location.pathname)}`
          }`}
        />

        {collapsed ? (
          <div className="relative z-10 grid h-full place-items-center">
            <span className="text-2xl leading-none text-white drop-shadow-sm" aria-label={activeItem.label}>
              {activeItem.icon}
            </span>
          </div>
        ) : (
          <div className="relative z-10 grid h-full grid-cols-3 items-center px-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => trackEvent(item.event, { from: location.pathname, to: item.to })}
                className={({ isActive }) =>
                  `flex h-full items-center justify-center rounded-full text-sm font-bold leading-none transition-colors duration-300 ${
                    isActive ? "text-white" : "text-primary-text/75 hover:text-primary-text"
                  }`
                }
              >
                <span className="relative z-10 whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
