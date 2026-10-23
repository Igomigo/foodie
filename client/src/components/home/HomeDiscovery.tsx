"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Search, X } from "lucide-react";
import { dishes, type Dish, type FoodCategory } from "@/data/food-inspiration";
import DishDialog from "@/components/shared/DishDialog";
import BrandButton from "@/components/shared/BrandButton";
import CravingCategories from "./CravingCategories";

export default function HomeDiscovery() {
  const [category, setCategory] = useState<FoodCategory>("All cravings");
  const [query, setQuery] = useState("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const visible = dishes.filter(
    (dish) =>
      (category === "All cravings" || dish.category === category) &&
      `${dish.name} ${dish.category} ${dish.description} ${dish.notes.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  return (
    <section
      id="cravings"
      aria-labelledby="discovery-heading"
      className="scroll-mt-32 py-10 lg:py-12"
    >
      <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[9px] font-semibold tracking-[.16em] text-foodie-action uppercase">
            Let your appetite lead
          </p>
          <h2
            id="discovery-heading"
            className="text-2xl font-medium tracking-[-.04em] sm:text-3xl"
          >
            What’s calling your name?
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-foodie-muted">
            A little food inspiration. Actual menus are coming next.
          </p>
        </div>
        <div className="relative w-full md:max-w-[320px]">
          <label htmlFor="food-search" className="sr-only">
            Search food inspiration
          </label>
          <Search
            size={17}
            aria-hidden="true"
            className="absolute top-4 left-4 text-foodie-muted"
          />
          <input
            id="food-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jollof, Oha soup, rice and stew…"
            className="h-12 w-full rounded-full border border-foodie-line bg-white/60 pr-10 pl-11 text-base outline-none focus:border-foodie-action focus:ring-3 focus:ring-foodie-action/10 sm:text-xs [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-0 right-1 grid size-12 place-items-center text-foodie-muted"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <CravingCategories selected={category} onSelect={setCategory} />
      <div className="mt-6 mb-4 flex items-center justify-between gap-3 text-[9px] font-medium tracking-[.12em] text-foodie-muted uppercase">
        <span>The craving edit</span>
        <span role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? "craving" : "cravings"}
          {query.trim() ? " found" : " to explore"}
        </span>
      </div>
      {visible.length ? (
        <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((dish, index) => (
            <article key={dish.id} className="group min-w-0">
              <button
                type="button"
                aria-label={`Explore ${dish.name}`}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setSelectedDish(dish);
                }}
                className="relative block aspect-[1.12] w-full overflow-hidden rounded-[22px] bg-[#eae7dc] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action"
              >
                <Image
                  src={dish.image}
                  quality={90}
                  alt={dish.alt}
                  fill
                  sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 290px"
                  className={`transition-transform duration-700 motion-safe:group-hover:scale-[1.06] ${dish.contain ? "object-contain p-2" : "object-cover"}`}
                />
                <span className="absolute top-3 left-3 rounded-md bg-foodie-paper/95 px-2.5 py-1.5 text-[8px] font-medium">
                  {dish.category}
                </span>
                <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-foodie-paper shadow-sm transition-colors group-hover:bg-foodie-sage">
                  <ArrowUpRight size={20} aria-hidden="true" />
                </span>
              </button>
              <p className="mt-4 text-[8px] font-semibold tracking-[.13em] text-foodie-action">
                {String(index + 1).padStart(2, "0")} / {dish.label}
              </p>
              <h3 className="mt-1.5 text-[15px] leading-snug font-medium tracking-tight">
                {dish.name}
              </h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-foodie-muted">
                {dish.description}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-foodie-line p-9 text-center">
          <h3 className="text-xl font-medium tracking-tight">
            Let’s try another craving.
          </h3>
          <p className="mt-3 text-xs text-foodie-muted">
            No matches in this food inspiration collection.
          </p>
          <button
            type="button"
            className="mt-4 min-h-11 text-xs font-semibold text-foodie-action underline"
            onClick={() => {
              setQuery("");
              setCategory("All cravings");
            }}
          >
            Show all cravings
          </button>
        </div>
      )}
      <DishDialog
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onRestoreFocus={() => trigger.current?.focus({ preventScroll: true })}
        action={
          <BrandButton onClick={() => setSelectedDish(null)}>
            Keep exploring
          </BrandButton>
        }
      />
    </section>
  );
}
