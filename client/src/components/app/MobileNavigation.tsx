"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavigation } from "./AppHeader";
import { cn } from "@/lib/utils";

export default function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-foodie-line bg-foodie-paper/98 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden"
    >
      {appNavigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={cn(
            "flex min-w-20 flex-col items-center gap-1.5 rounded-xl px-4 py-1 text-[9px]",
            pathname === item.href
              ? "font-semibold text-foodie-action"
              : "text-foodie-muted",
          )}
        >
          <item.icon size={21} strokeWidth={1.6} aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
