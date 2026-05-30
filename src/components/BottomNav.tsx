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
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-3 pt-2 safe-area-bottom">
      {/* خلفية زجاجية فاخرة مع تحسين التباين */}
      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-athar-primary-200/30 dark:border-athar-primary-700/30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]" />

      {/* قائمة الأزرار مع مساحات نقر موسعة */}
      <div className="relative flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.path)}
              className={clsx(
                "relative flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all duration-200 active:scale-95 touch-manipulation",
                isActive
                  ? "text-athar-accent-600 dark:text-athar-accent-400 scale-105"
                  : "text-athar-text-muted/70 dark:text-gray-400 hover:text-athar-primary-500 dark:hover:text-athar-primary-400"
              )}
              style={{ touchAction: "manipulation" }}
            >
              <item.icon className={clsx("w-6 h-6 transition-all duration-200", isActive && "drop-shadow-[0_2px_4px_rgba(34,102,92,0.3)]")} />
              <span className="text-xs font-medium leading-tight">{item.label}</span>
              {/* شريط سفلي نشط بدلاً من النقطة لتسهيل الرؤية */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-athar-accent-500 shadow-[0_0_6px_rgba(34,102,92,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
