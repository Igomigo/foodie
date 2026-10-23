import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const linkColours = {
  orange:
    "bg-foodie-action text-white hover:bg-[#ad391a] shadow-[0_6px_18px_#c7472415]",
  dark: "bg-foodie-forest text-foodie-paper hover:bg-[#182a1a]",
  light: "bg-[#e7efcc] text-foodie-forest hover:bg-[#f3facd]",
  outline: "border border-[#7d866d] text-foodie-forest hover:bg-[#e8ebdc]",
};

export function ActionLink({
  href,
  children,
  variant = "orange",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof linkColours;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-h-[53px] items-center justify-center gap-6 rounded-full px-6 py-4 text-xs font-semibold transition-[background-color,transform,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action",
        linkColours[variant],
        className,
      )}
    >
      {children}
      <ArrowUpRight
        size={19}
        aria-hidden="true"
        className="transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[10px] leading-relaxed font-semibold tracking-[.16em] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
