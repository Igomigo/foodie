"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  Grid2X2,
  Coffee,
  CupSoda,
  IceCreamBowl,
  Sprout,
  Utensils,
  Wheat,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { FoodCategory } from "@/types/discovery";
const photos: Record<string, string> = {
  rice: "/images/landing-jollof.png",
  "soups-swallows": "/images/foodie-banga-starch.png",
  grills: "/images/foodie-suya.png",
  "bakery-snacks": "/images/foodie-small-chops.png",
};
const icons = {
  "pasta-noodles": Utensils,
  "beans-yam": Sprout,
  breakfast: Coffee,
  desserts: IceCreamBowl,
  drinks: CupSoda,
};
export default function CravingCategories({
  selected,
  categories,
  allCategories,
  onSelect,
}: {
  selected: string;
  categories: FoodCategory[];
  allCategories: FoodCategory[];
  onSelect: (category: string) => void;
}) {
  const moreTrigger = useRef<HTMLButtonElement>(null);
  const [more, setMore] = useState(false);
  const visible = [...categories];
  const selectedCategory = allCategories.find(
    (category) => category.id === selected,
  );
  if (selectedCategory && !visible.some((category) => category.id === selected))
    visible.push(selectedCategory);
  function choose(value: string) {
    onSelect(value);
    setMore(false);
  }
  return (
    <>
      <div
        role="group"
        aria-label="Food categories"
        className="flex gap-3 overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:thin] sm:gap-5"
      >
        {[
          { id: "", name: "All" },
          ...visible,
          { id: "more", name: "More" },
        ].map((category) => {
          const Icon =
            category.id === "" || category.id === "more"
              ? Grid2X2
              : icons[category.id as keyof typeof icons] || Wheat;
          return (
            <button
              key={category.id}
              ref={category.id === "more" ? moreTrigger : undefined}
              type="button"
              aria-pressed={
                category.id !== "more" ? selected === category.id : undefined
              }
              aria-haspopup={category.id === "more" ? "dialog" : undefined}
              onClick={() =>
                category.id === "more" ? setMore(true) : choose(category.id)
              }
              className="group flex min-w-20 shrink-0 flex-col items-center gap-2 rounded-2xl px-1 pt-1 pb-2 text-center focus-visible:outline-2 focus-visible:outline-foodie-action"
            >
              <span
                className={`relative grid size-16 place-items-center overflow-hidden rounded-full border transition-colors sm:size-18 ${selected === category.id ? "border-foodie-action bg-[#f6e8d7] ring-2 ring-foodie-action/15" : "border-foodie-line bg-[#eeeee3] group-hover:bg-foodie-sage/40"}`}
              >
                {photos[category.id] ? (
                  <Image
                    src={photos[category.id]}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <Icon
                    size={25}
                    strokeWidth={1.4}
                    aria-hidden="true"
                    className={
                      selected === category.id
                        ? "text-foodie-action"
                        : "text-foodie-forest/75"
                    }
                  />
                )}
              </span>
              <span
                className={`max-w-24 text-[10px] leading-snug sm:text-xs ${selected === category.id ? "font-semibold text-foodie-action" : "font-medium text-foodie-forest"}`}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
      <Dialog open={more} onOpenChange={setMore}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            moreTrigger.current?.focus({ preventScroll: true });
          }}
          className="max-h-[85dvh] w-[calc(100vw-32px)] max-w-lg overflow-y-auto rounded-3xl border-foodie-line bg-foodie-paper text-foodie-ink motion-reduce:animate-none"
        >
          <DialogTitle className="text-2xl font-medium tracking-tight">
            What are you craving?
          </DialogTitle>
          <DialogDescription className="text-sm text-foodie-muted">
            Choose a category to explore kitchens and dishes at your selected
            location.
          </DialogDescription>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[{ id: "", name: "All" }, ...allCategories].map((category) => (
              <button
                key={category.id}
                onClick={() => choose(category.id)}
                aria-pressed={selected === category.id}
                className={`min-h-12 rounded-xl border p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-foodie-action ${selected === category.id ? "border-foodie-action bg-foodie-action/5 text-foodie-action" : "border-foodie-line bg-white/60"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
