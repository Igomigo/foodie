"use client";
import { ArrowUpRight } from "lucide-react";
import FoodImage from "./FoodImage";
import { formatMealPrice } from "@/lib/food-format";
import type { MenuItem } from "@/types/discovery";
export default function MealCard({
  item,
  onSelect,
}: {
  item: MenuItem;
  onSelect: (item: MenuItem, trigger: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => onSelect(item, event.currentTarget)}
      className="group flex w-full min-w-0 gap-4 rounded-3xl border border-foodie-line bg-white/60 p-4 text-left transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foodie-action"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-base leading-snug font-medium tracking-tight">
          {item.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foodie-muted">
          {item.description}
        </p>
        <p className="mt-3 text-sm font-medium text-foodie-action">
          {formatMealPrice(item)}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-foodie-muted">
          {item.isAvailable ? "View meal" : "Unavailable · view details"}
          <ArrowUpRight size={12} aria-hidden="true" />
        </span>
      </div>
      <div className="relative size-24 shrink-0 self-center overflow-hidden rounded-2xl bg-[#eeeadd] sm:size-28">
        <FoodImage src={item.imageUrl} alt={item.name} sizes="112px" />
      </div>
    </button>
  );
}
