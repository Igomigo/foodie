import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
