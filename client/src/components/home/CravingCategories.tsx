"use client";

import Image from "next/image";
import { Utensils } from "lucide-react";
import { foodCategories, type FoodCategory } from "@/data/food-inspiration";
import { cn } from "@/lib/utils";

const images: Record<string, string> = {
  "Rice bowls": "/images/landing-jollof.png",
  "Soups & swallows": "/images/foodie-egusi-eba.png",
  "Off the grill": "/images/foodie-suya.png",
  "Small chops": "/images/foodie-small-chops.png",
};

export default function CravingCategories({
  selected,
  onSelect,
}: {
  selected: FoodCategory;
  onSelect: (category: FoodCategory) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter food inspiration"
      className="flex gap-3 overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:thin] sm:gap-4"
    >
      {foodCategories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={selected === category}
          onClick={() => onSelect(category)}
          className={cn(
            "group flex min-h-[70px] shrink-0 items-center gap-3 rounded-2xl border pr-5 pl-2 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foodie-action",
            selected === category
              ? "border-foodie-forest bg-foodie-forest text-foodie-paper"
              : "border-foodie-line bg-white/45 hover:border-foodie-forest/50",
          )}
        >
          <span
            className={cn(
              "relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl",
              category === "All cravings"
                ? "bg-foodie-sage/25"
                : "bg-[#eeeadd]",
            )}
          >
            {category === "All cravings" ? (
              <Utensils size={21} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Image
                src={images[category]}
                alt=""
                fill
                sizes="48px"
                className={cn(
                  "object-cover transition-transform duration-500 motion-safe:group-hover:scale-110",
                  category === "Rice bowls" && "object-contain",
                )}
              />
            )}
          </span>
          {category}
        </button>
      ))}
    </div>
  );
}
