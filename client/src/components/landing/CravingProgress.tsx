"use client";

import { motion, type MotionValue } from "motion/react";

export default function CravingProgress({
  first,
  last,
  total,
  progress,
}: {
  first: number;
  last: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const number = (value: number) => String(value).padStart(2, "0");

  return (
    <div className="mt-5 flex items-center gap-5" aria-hidden="true">
      <div className="flex shrink-0 items-baseline gap-1.5 text-[10px] tabular-nums">
        <span className="font-medium text-foodie-action">
          {number(first)}–{number(last)}
        </span>
        <span className="text-foodie-muted/60">/ {number(total)}</span>
      </div>
      <div className="relative h-px flex-1 bg-foodie-line">
        <motion.div
          style={{ scaleX: progress }}
          className="absolute inset-0 origin-left bg-foodie-action"
        />
      </div>
      <span className="hidden text-[9px] tracking-[.15em] text-foodie-muted uppercase sm:block">
        Good taste. Keep going.
      </span>
    </div>
  );
}
