import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export default function FilterPill({
  active = false,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foodie-action",
        active
          ? "border-foodie-forest bg-foodie-forest text-foodie-paper"
          : "border-foodie-line bg-white/70 text-foodie-muted hover:border-foodie-forest/25 hover:text-foodie-forest",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
