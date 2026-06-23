import { NavLink } from "react-router-dom";

const items = [
  { to: "/dhikr", label: "الأذكار" },
  { to: "/", label: "الرئيسية", center: true },
  { to: "/quran", label: "المصحف" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-5 inset-x-4 z-50 mx-auto max-w-sm">
      <div className="relative flex h-20 items-center justify-between rounded-[34px] bg-white px-7 shadow-xl">
        <div className="absolute bottom-0 left-1/2 h-12 w-28 -translate-x-1/2 rounded-t-[60px] bg-action" />
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative z-10 flex min-w-16 flex-col items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
                item.center
                  ? "-mt-7 text-white"
                  : isActive
                  ? "text-action"
                  : "text-secondary-text"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`mb-1 grid place-items-center rounded-full transition-all duration-200 ${
                    item.center
                      ? "h-14 w-14 bg-white text-lg text-action shadow-lg"
                      : isActive
                      ? "h-9 w-9 bg-mint-soft text-action"
                      : "h-9 w-9 bg-white text-secondary-text"
                  }`}
                >
                  {item.center ? "أ" : item.label.slice(0, 1)}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
