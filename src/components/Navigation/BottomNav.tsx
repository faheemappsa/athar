import { NavLink, useLocation } from "react-router-dom";
import { trackEvent } from "../../utils/analytics";

const items = [
  { to: "/quran", label: "المصحف", event: "nav_quran" },
  { to: "/", label: "الرئيسية", event: "nav_home" },
  { to: "/dhikr", label: "الأذكار", event: "nav_dhikr" },
];

const getIndicatorPosition = (pathname: string) => {
  if (pathname === "/quran") return "left-[83.33%]";
  if (pathname === "/dhikr") return "left-[16.66%]";
  return "left-1/2";
};

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-6 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-[340px]">
      <div className="relative h-[72px] overflow-hidden rounded-full border border-white/60 bg-white/70 shadow-2xl shadow-black/10 ring-1 ring-action/10 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/55">
        <div
          className={`absolute bottom-2 h-14 w-24 -translate-x-1/2 rounded-full bg-action/95 shadow-sm transition-all duration-300 ease-out ${getIndicatorPosition(
            location.pathname
          )}`}
        />
        <div className="relative z-10 grid h-full grid-cols-3 items-center px-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => trackEvent(item.event, { from: location.pathname, to: item.to })}
              className={({ isActive }) =>
                `flex h-full items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  isActive ? "text-white" : "text-secondary-text"
                }`
              }
            >
              <span className="relative z-10 whitespace-nowrap leading-none">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
