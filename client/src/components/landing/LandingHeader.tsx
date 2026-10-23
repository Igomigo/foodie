"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import Brand from "@/components/Brand";
import BrandButton from "@/components/shared/BrandButton";

const navigation = [
  { label: "Find your next chop", href: "#cravings" },
  { label: "How it works", href: "#how-it-works" },
  { label: "For the cooks", href: "#for-the-cooks" },
];

export default function LandingHeader({
  exploreHref,
  isLoggedIn,
}: {
  exploreHref: string;
  isLoggedIn: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuTrigger.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-foodie-ink/8 bg-foodie-paper/92 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between gap-5 px-6 sm:px-10 lg:h-24 lg:px-14">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex lg:gap-9"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[11px] font-medium text-foodie-muted transition-colors hover:text-foodie-action"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 lg:gap-6">
          <Link
            href={isLoggedIn ? "/home" : "/auth/login"}
            className="hidden text-xs text-foodie-muted hover:text-foodie-action lg:block"
          >
            {isLoggedIn ? "My account" : "Log in"}
          </Link>
          <BrandButton
            href={exploreHref}
            variant="outline"
            size="compact"
            className="max-[360px]:hidden"
          >
            Oya, let’s eat
          </BrandButton>
          <button
            ref={menuTrigger}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-foodie-ink/5 md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 border-b border-foodie-line bg-foodie-paper px-6 pb-5 shadow-[0_20px_30px_#263c3108] md:hidden"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between border-b border-foodie-line py-4 text-sm"
            >
              {item.label}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ))}
          <Link
            href={isLoggedIn ? "/home" : "/auth/login"}
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between py-4 text-sm text-foodie-action"
          >
            {isLoggedIn ? "Go to my account" : "Log in to your account"}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </nav>
      )}
    </header>
  );
}
