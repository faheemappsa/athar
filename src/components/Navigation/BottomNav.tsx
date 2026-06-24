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
    <nav className="fixed inset-x-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm">
      <div className="relative h-20 overflow-hidden rounded-[34px] bg-white shadow-xl shadow-action/10">
        <div
          className={`absolute bottom-0 h-16 w-28 -translate-x-1/2 rounded-t-[80px] bg-action transition-all duration-300 ease-out ${getIndicatorPosition(
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
                  isActive ? "-translate-y-2 text-white" : "translate-y-0 text-secondary-text"
                }`
              }
            >
              <span className="relative z-10 whitespace-nowrap leading-none drop-shadow-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
