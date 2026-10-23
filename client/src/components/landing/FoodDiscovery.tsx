"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Utensils } from "lucide-react";
import { useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { dishes, foodCategories, type Dish, type FoodCategory } from "./dishes";
import DishCard from "./DishCard";
import DishDialog from "./DishDialog";
import Reveal from "./Reveal";
import { Eyebrow } from "./ui";
import CravingProgress from "./CravingProgress";

export default function FoodDiscovery({
  exploreHref,
}: {
  exploreHref: string;
}) {
  const [category, setCategory] = useState<FoodCategory>("All cravings");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [canScroll, setCanScroll] = useState({
    previous: false,
    next: true,
    first: 1,
    last: 1,
  });
  const progress = useMotionValue(0);
  const track = useRef<HTMLDivElement>(null);
  const dishTrigger = useRef<HTMLButtonElement | null>(null);
  const reducedMotion = useReducedMotion();
  const visibleDishes = dishes.filter(
    (dish) => category === "All cravings" || dish.category === category,
  );

  function updateScroll() {
    const element = track.current;
    if (!element) return;
    const cards = Array.from(element.children) as HTMLElement[];
    const left = element.getBoundingClientRect().left;
    const visible = cards.flatMap((card, index) => {
      const bounds = card.getBoundingClientRect();
      // Count cards with at least half their width in view.
      const overlap =
        Math.min(bounds.right, left + element.clientWidth) -
        Math.max(bounds.left, left);
      return overlap >= bounds.width / 2 ? [index + 1] : [];
    });
    const maxScroll = element.scrollWidth - element.clientWidth;
    progress.set(
      maxScroll > 0
        ? Math.max(0, Math.min(1, element.scrollLeft / maxScroll))
        : 1,
    );
    const next = {
      previous: element.scrollLeft > 4,
      next: element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
      first: visible[0] ?? 1,
      last: visible.at(-1) ?? 1,
    };
    setCanScroll((current) =>
      current.previous === next.previous &&
      current.next === next.next &&
      current.first === next.first &&
      current.last === next.last
        ? current
        : next,
    );
  }

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    element.scrollTo({ left: 0, behavior: "instant" });
    updateScroll();
    const observer = new ResizeObserver(updateScroll);
    observer.observe(element);
    return () => observer.disconnect();
  }, [category]);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const firstCard = element.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({
      left: direction * ((firstCard?.offsetWidth ?? element.clientWidth) + gap),
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }

  return (
    <section
      id="cravings"
      aria-labelledby="cravings-heading"
      className="mx-auto max-w-[1360px] px-6 py-20 sm:px-10 lg:px-14 lg:py-26"
    >
      <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>LET YOUR APPETITE LEAD</Eyebrow>
          <h2
            id="cravings-heading"
            className="mt-4 text-[clamp(2.7rem,5vw,4.1rem)] leading-[1.07] font-medium tracking-[-.055em]"
          >
            A craving for
            <br />
            <em className="font-foodie-display font-normal text-[#727b59]">
              every kind of day.
            </em>
          </h2>
        </div>
        <p className="max-w-[260px] text-xs leading-[1.9] text-foodie-muted">
          From a quick “something light” to Sunday-rice energy. There’s a plate
          for your mood.
        </p>
      </Reveal>

      <div
        className="mt-8 mb-7 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter food inspiration"
      >
        {foodCategories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] transition-colors",
              category === item
                ? "border-foodie-forest bg-foodie-forest text-foodie-paper"
                : "border-foodie-line text-foodie-muted hover:border-foodie-muted hover:text-foodie-ink",
            )}
          >
            {item === "All cravings" && (
              <Utensils size={14} aria-hidden="true" />
            )}
            {item}
          </button>
        ))}
      </div>

      <p className="sr-only" role="status">
        {visibleDishes.length} {visibleDishes.length === 1 ? "dish" : "dishes"}{" "}
        in {category.toLowerCase()}.
      </p>
      <div
        aria-hidden="true"
        className="mb-2 flex items-center justify-between text-[9px] font-medium tracking-[.16em] text-foodie-muted uppercase"
      >
        <span>The craving edit</span>
        <span className="flex items-center gap-2">
          Swipe. Find your thing. <ArrowRight size={13} />
        </span>
      </div>
      <div
        ref={track}
        id="food-inspiration"
        role="region"
        aria-label="Food inspiration carousel"
        aria-roledescription="carousel"
        tabIndex={canScroll.previous || canScroll.next ? 0 : -1}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        onScroll={updateScroll}
        className="flex snap-x snap-proximity gap-5 overflow-x-auto overscroll-x-contain px-1 pt-3 pb-6 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action sm:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {visibleDishes.map((dish, index) => (
          <DishCard
            key={dish.id}
            dish={dish}
            index={index}
            onOpen={(selected, trigger) => {
              dishTrigger.current = trigger;
              setSelectedDish(selected);
            }}
          />
        ))}
      </div>
      <CravingProgress
        first={canScroll.first}
        last={canScroll.last}
        total={visibleDishes.length}
        progress={progress}
      />

      <div className="mt-5 flex items-center justify-between gap-5">
        <div>
          {/* <p className="text-[11px] font-medium">
            {visibleDishes.length}{" "}
            {visibleDishes.length === 1 ? "craving" : "cravings"}. Plenty of
            possibilities.
          </p>
          <p className="mt-1 text-[10px] text-foodie-muted">
            Food inspiration. Actual menus vary by kitchen.
          </p> */}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous dishes"
            aria-controls="food-inspiration"
            disabled={!canScroll.previous}
            onClick={() => move(-1)}
            className="grid size-11 place-items-center rounded-full border border-foodie-line transition-colors enabled:hover:border-foodie-ink enabled:hover:bg-foodie-ink enabled:hover:text-foodie-paper disabled:cursor-default disabled:opacity-30"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next dishes"
            aria-controls="food-inspiration"
            disabled={!canScroll.next}
            onClick={() => move(1)}
            className="grid size-11 place-items-center rounded-full border border-foodie-line transition-colors enabled:hover:border-foodie-ink enabled:hover:bg-foodie-ink enabled:hover:text-foodie-paper disabled:cursor-default disabled:opacity-30"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <DishDialog
        dish={selectedDish}
        exploreHref={exploreHref}
        onClose={() => setSelectedDish(null)}
        onRestoreFocus={() =>
          dishTrigger.current?.focus({ preventScroll: true })
        }
      />
    </section>
  );
}
