import { NavLink } from "react-router-dom";

const items = [
  { to: "/quran", label: "المصحف" },
  { to: "/", label: "الرئيسية", center: true },
  { to: "/dhikr", label: "الأذكار" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-5 inset-x-4 z-50 mx-auto max-w-sm">
      <div className="relative flex h-20 items-center justify-between rounded-[34px] bg-white px-8 shadow-xl shadow-action/10">
        <div className="absolute bottom-0 left-1/2 h-12 w-28 -translate-x-1/2 rounded-t-[70px] bg-action" />
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative z-10 flex min-w-16 flex-col items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
                item.center ? "-mt-7 text-white" : isActive ? "text-action" : "text-secondary-text"
              }`
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
