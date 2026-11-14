"use client";
import { cn } from "@/lib/utils";
import type { FoodCategory } from "@/types/discovery";

export default function CravingCategories({
  selected,
  categories,
  onSelect,
}: {
  selected: string;
  categories: FoodCategory[];
  onSelect: (category: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Food categories"
      className="flex gap-2 overflow-x-auto overscroll-x-contain py-1 [scrollbar-width:thin]"
    >
      {[{ id: "", name: "All kitchens" }, ...categories].map((category) => (
        <button
          key={category.id}
          type="button"
          aria-pressed={selected === category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            "min-h-11 shrink-0 rounded-full border px-4 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foodie-action",
            selected === category.id
              ? "border-foodie-forest bg-foodie-forest text-foodie-paper"
              : "border-foodie-line bg-white/60 hover:border-foodie-forest/50",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
