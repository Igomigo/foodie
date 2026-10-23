import Link from "next/link";
import { Soup } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Foodie home"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 text-[30px] leading-none font-bold tracking-[-1.8px] text-foodie-ink",
        className,
      )}
    >
      <Soup
        className="size-7 text-foodie-orange"
        strokeWidth={1.7}
        aria-hidden="true"
      />
      <span>
        foodie<span className="text-foodie-orange">.</span>
      </span>
    </Link>
  );
}
