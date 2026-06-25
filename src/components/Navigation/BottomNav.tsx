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

  useEffect(() => {
    const scrollElement = document.getElementById("app-scroll");
    if (!scrollElement) return;

    let lastScrollTop = scrollElement.scrollTop;

    const handleScroll = () => {
      const currentScrollTop = scrollElement.scrollTop;
      const isScrollingDown = currentScrollTop > lastScrollTop && currentScrollTop > 24;
      const isNearTop = currentScrollTop < 12;

      setIsCollapsed(isScrollingDown && !isNearTop);
      lastScrollTop = currentScrollTop;
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed inset-x-6 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-[340px]">
      <div
        className={`relative overflow-hidden rounded-full border border-white/60 bg-white/70 shadow-2xl shadow-black/10 ring-1 ring-action/10 backdrop-blur-2xl transition-all duration-300 supports-[backdrop-filter]:bg-white/55 ${
          isCollapsed ? "h-[58px] max-w-[250px] mx-auto" : "h-[72px] max-w-[340px]"
        }`}
      >
        <div
          className={`absolute -translate-x-1/2 rounded-full bg-action/95 shadow-sm transition-all duration-300 ease-out ${
            isCollapsed ? "bottom-1.5 h-11 w-16" : "bottom-2 h-14 w-24"
          } ${getIndicatorPosition(location.pathname)}`}
        />
        <div className="relative z-10 grid h-full grid-cols-3 items-center px-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => trackEvent(item.event, { from: location.pathname, to: item.to })}
              className={({ isActive }) =>
                `flex h-full flex-col items-center justify-center rounded-full font-bold transition-all duration-300 ${
                  isActive ? "text-white" : "text-secondary-text"
                } ${isCollapsed ? "gap-0 text-lg" : "gap-1 text-sm"}`
              }
            >
              <span className={`relative z-10 leading-none transition-all duration-300 ${isCollapsed ? "scale-110" : "scale-100 text-base"}`}>
                {item.icon}
              </span>
              <span
                className={`relative z-10 whitespace-nowrap leading-none transition-all duration-300 ${
                  isCollapsed ? "max-h-0 scale-90 opacity-0" : "max-h-4 scale-100 opacity-100"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
