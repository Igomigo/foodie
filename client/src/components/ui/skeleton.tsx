import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-lg bg-foodie-line/60 motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}
