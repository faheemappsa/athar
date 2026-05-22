"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, CalendarHeart, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { id: "home", label: "الرئيسية", icon: LayoutDashboard, path: "/" },
  { id: "adhkar", label: "أذكار", icon: BookOpen, path: "/adhkar" },
  { id: "journal", label: "سجلي", icon: CalendarHeart, path: "/journal" },
  { id: "more", label: "المزيد", icon: MoreHorizontal, path: "/more" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (path: string) => {
    if (pathname === path) return;
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-4 py-2 flex justify-around items-center z-50 safe-area-bottom">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.path)}
            className={clsx(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 active:scale-95",
              isActive
                ? "text-athar-primary"
                : "text-gray-400 hover:text-athar-muted"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-athar-primary" />}
          </button>
        );
      })}
    </nav>
  );
}
