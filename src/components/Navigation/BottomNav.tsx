import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navSections } from "../../config/sections";
import { trackEvent } from "../../utils/analytics";

const items = navSections.map((section) => ({
  to: section.path,
  label: section.nav.label,
  icon: section.nav.icon,
  event: section.nav.event,
}));

const homeItem = items.find((item) => item.to === "/") || items[0];

export default function BottomNav() {
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeItem = useMemo(() => items.find((item) => item.to === location.pathname) || homeItem, [location.pathname]);

  useEffect(() => {
    setIsCollapsed(false);
  }, [location.pathname]);

  useEffect(() => {
    const scrollElement = document.getElementById("app-scroll");
    if (!scrollElement) return;

    let lastScrollTop = scrollElement.scrollTop;

    const handleScroll = () => {
      const currentScrollTop = scrollElement.scrollTop;
      const isScrollingDown = currentScrollTop > lastScrollTop && currentScrollTop > 24;

      if (isScrollingDown) {
        setIsCollapsed(true);
      }

      lastScrollTop = currentScrollTop;
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && navRef.current?.contains(target)) return;
      setIsCollapsed(true);
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const expandNav = () => {
    if (!isCollapsed) return;
    setIsCollapsed(false);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed z-50 transition-all duration-500 ease-out will-change-transform ${
        isCollapsed
          ? "bottom-[max(1rem,env(safe-area-inset-bottom))] right-5 w-[58px] translate-x-0 translate-y-0"
          : "bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 w-[min(340px,calc(100vw-3rem))] -translate-x-1/2 translate-y-0"
      }`}
      style={{ transform: isCollapsed ? "translate3d(0,0,0)" : "translate3d(-50%,0,0)" }}
      aria-label="التنقل السفلي"
    >
      <div
        onClick={expandNav}
        className={`relative overflow-hidden border border-white/45 bg-white/30 shadow-[0_18px_40px_rgba(30,27,24,0.12)] ring-1 ring-white/35 backdrop-blur-2xl transition-all duration-500 ease-out supports-[backdrop-filter]:bg-white/22 ${
          isCollapsed ? "grid h-[58px] w-[58px] cursor-pointer place-items-center rounded-[24px]" : "h-[68px] w-full rounded-[32px]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-white/15 to-white/5" />

        {isCollapsed ? (
          <span className="relative z-10 grid h-11 w-11 place-items-center rounded-[18px] bg-action/85 text-2xl leading-none text-white shadow-[0_10px_24px_rgba(72,173,141,0.24)]" aria-label={activeItem.label}>
            {activeItem.icon}
          </span>
        ) : (
          <div className="relative z-10 grid h-full grid-cols-3 items-center px-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => trackEvent(item.event, { from: location.pathname, to: item.to })}
                className={({ isActive }) =>
                  `flex h-full items-center justify-center rounded-full text-sm font-bold leading-none transition-colors duration-300 ${
                    isActive ? "text-action" : "text-primary-text/70 hover:text-primary-text"
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
