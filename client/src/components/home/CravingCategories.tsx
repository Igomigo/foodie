"use client";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import FilterPill from "@/components/shared/FilterPill";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { FoodCategory } from "@/types/discovery";
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
        className="scrollbar-hide flex gap-2 overflow-x-auto overscroll-x-contain px-0.5 py-2"
      >
        {[
          { id: "", name: "All" },
          ...visible,
          { id: "more", name: "More" },
        ].map((category) => {
          return (
            <FilterPill
              key={category.id}
              ref={category.id === "more" ? moreTrigger : undefined}
              active={selected === category.id}
              type="button"
              aria-pressed={
                category.id !== "more" ? selected === category.id : undefined
              }
              aria-haspopup={category.id === "more" ? "dialog" : undefined}
              onClick={() =>
                category.id === "more" ? setMore(true) : choose(category.id)
              }
            >
              {category.name}
              {category.id === "more" && (
                <ChevronDown size={14} aria-hidden="true" />
              )}
            </FilterPill>
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
