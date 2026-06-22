import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const items = [
    { to: "/", label: "الرئيسية" },
    { to: "/dhikr", label: "الأذكار" },
    { to: "/quran", label: "المصحف" },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-[#1A3B5C] text-white" : "text-[#6B7280] hover:opacity-90"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
