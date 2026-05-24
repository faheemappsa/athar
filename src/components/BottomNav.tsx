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
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-2 pt-1.5 safe-area-bottom">
      {/* خلفية زجاجية فاخرة */}
      <div className="absolute inset-0 bg-athar-primary-700/95 dark:bg-athar-primary-900/95 backdrop-blur-md border-t border-athar-primary-400/20 dark:border-athar-primary-600/30" />

      {/* قائمة الأزرار */}
      <div className="relative flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.path)}
              className={clsx(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 active:scale-90",
                isActive
                  ? "text-athar-accent-400 scale-105"
                  : "text-athar-primary-200/70 dark:text-athar-primary-300/50 hover:text-athar-accent-300"
              )}
            >
              <item.icon className={clsx("w-5 h-5 transition-all duration-300", isActive && "drop-shadow-[0_0_6px_rgba(212,163,115,0.6)]")} />
              <span className="text-xs font-medium">{item.label}</span>
              {/* نقطة مضيئة أسفل الأيقونة النشطة */}
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-athar-accent-400 shadow-[0_0_8px_rgba(212,163,115,0.8)] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
