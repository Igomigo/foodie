"use client";

import FilterPill from "@/components/shared/FilterPill";
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
      className="scrollbar-hide flex gap-2 overflow-x-auto overscroll-x-contain px-0.5 py-2"
    >
      {[{ id: "", name: "All" }, ...categories].map((category) => (
        <FilterPill
          key={category.id}
          active={selected === category.id}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </FilterPill>
      ))}
    </div>
  );
}
