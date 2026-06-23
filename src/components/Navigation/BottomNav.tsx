import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const items = [
    { to: "/", label: "الرئيسية" },
    { to: "/dhikr", label: "الأذكار" },
    { to: "/quran", label: "المصحف" },
  ];

  return (
    <nav className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-md rounded-full bg-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-[#EAF6F3] text-[#2F9D75]" : "text-[#6F8F86]"
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
