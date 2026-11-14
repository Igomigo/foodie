"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { appNavigation } from "./AppHeader";
import { cn } from "@/lib/utils";

export default function MobileNavigation() {
  const pathname = usePathname();
  const params = useSearchParams();
  const searching = pathname === "/home" && params.get("view") === "search";
  const searchParams = new URLSearchParams(
    pathname === "/home" ? params.toString() : "",
  );
  searchParams.set("view", "search");
  const items = [
    ...appNavigation,
    { href: `/home?${searchParams}`, label: "Search", icon: Search },
  ];

  function isActive(label: string, href: string) {
    if (label === "Search") return searching;
    if (href === "/home")
      return (
        !searching &&
        (pathname === "/home" || pathname.startsWith("/kitchens/"))
      );
    return pathname === href;
  }
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-30 mx-auto grid max-w-md grid-cols-4 gap-1 rounded-full border border-white/80 bg-foodie-paper/95 p-1.5 shadow-[0_8px_40px_#263c311a] backdrop-blur-xl md:hidden"
    >
      {items.map((item) => {
        const active = isActive(item.label, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-full px-1 py-1.5 text-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-foodie-action",
              active
                ? "bg-foodie-action/8 font-semibold text-foodie-action"
                : "text-foodie-muted hover:bg-foodie-ink/5",
            )}
          >
            <item.icon
              size={20}
              strokeWidth={active ? 2 : 1.6}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
