"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, ClipboardList, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/check", label: "Check", icon: ShieldCheck },
  { href: "/log", label: "Log", icon: ClipboardList },
  { href: "/summary", label: "Summary", icon: BarChart3 },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/5"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-[#6366f1] bg-[#6366f1]/10"
                  : "text-[#8b8ba0] hover:text-[#f0f0f5]"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
