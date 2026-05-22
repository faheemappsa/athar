"use client";

import { LayoutDashboard, BookOpen, CalendarHeart, MoreHorizontal } from "lucide-react";

const navItems = [
  { id: "home", label: "الرئيسية", icon: LayoutDashboard, active: true },
  { id: "adhkar", label: "أذكار", icon: BookOpen, active: false },
  { id: "journal", label: "سجلي", icon: CalendarHeart, active: false },
  { id: "more", label: "المزيد", icon: MoreHorizontal, active: false },
];

export default function BottomNav() {
  const handleClick = (id: string) => {
    if (id === "home") return;
    alert("قريباً إن شاء الله");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-2 flex justify-around items-center z-50 safe-area-bottom">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item.id)}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 active:scale-95 ${
            item.active
              ? "text-athar-primary"
              : "text-gray-400 hover:text-athar-muted"
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-xs font-medium">{item.label}</span>
          {item.active && <span className="w-1 h-1 rounded-full bg-athar-primary" />}
        </button>
      ))}
    </nav>
  );
}
