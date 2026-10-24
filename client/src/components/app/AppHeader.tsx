"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Compass, ShoppingBag, Settings } from "lucide-react";
import Brand from "@/components/Brand";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

export const appNavigation = [
  { href: "/home", label: "Discover", icon: Compass },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { data: user } = useProfile();
  const location = user?.location;
  const displayLocation = location
    ? [location.area || location.lga, location.city].filter(Boolean).join(", ")
    : "Location not set";

  return (
    <header className="sticky top-0 z-30 border-b border-foodie-ink/8 bg-foodie-paper/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3 px-4 py-5 sm:px-10 lg:px-14">
        <Brand href="/home" className="text-[27px] sm:text-[30px]" />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-2 md:flex"
        >
          {appNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "rounded-full px-5 py-3 text-xs transition-colors hover:bg-foodie-ink/5",
                pathname === item.href
                  ? "bg-foodie-forest text-foodie-paper hover:bg-foodie-forest"
                  : "text-foodie-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <div
            aria-label={`Saved location: ${displayLocation}`}
            title={displayLocation}
            className="flex min-w-0 items-center gap-1.5 sm:gap-2.5"
          >
            <MapPin
              size={15}
              className="shrink-0 text-foodie-action"
              aria-hidden="true"
            />
            <span className="min-w-0 max-w-[96px] min-[375px]:max-w-[135px] sm:max-w-[190px]">
              <span className="hidden text-[8px] tracking-[.13em] text-foodie-muted uppercase sm:block">
                Your neighbourhood
              </span>
              <span className="block truncate text-[10px] font-medium sm:mt-1 sm:text-[11px]">
                {displayLocation}
              </span>
            </span>
          </div>
          <Link
            href="/settings"
            aria-label="Your account and settings"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-foodie-forest/15 bg-foodie-sage/35 text-sm font-medium text-foodie-forest"
          >
            {(user?.firstName || user?.username || "F")
              .slice(0, 1)
              .toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  );
}
