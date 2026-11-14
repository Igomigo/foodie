"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import FoodImage from "@/components/shared/FoodImage";
import { formatMealPrice } from "@/lib/food-format";
import type { DiscoveryMeal } from "@/types/discovery";

export default function MealCollection({
  title,
  description,
  items,
  returnTo,
  onSeeAll,
  grid = false,
}: {
  title: string;
  description?: string;
  items: DiscoveryMeal[];
  returnTo: string;
  onSeeAll?: () => void;
  grid?: boolean;
}) {
  const rail = useRef<HTMLDivElement>(null);
  function scroll(direction: number) {
    if (rail.current)
      rail.current.scrollBy({
        left: direction * rail.current.clientWidth * 0.8,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  if (!items.length) return null;
  return (
    <section
      aria-label={title}
      className="mt-9 border-t border-foodie-line pt-7"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium tracking-[-.035em] sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-xs leading-relaxed text-foodie-muted">
              {description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="min-h-11 px-2 text-xs font-medium text-foodie-action"
            >
              See all
            </button>
          )}
          {!grid && (
            <>
              <button
                type="button"
                aria-label={`Scroll ${title} left`}
                onClick={() => scroll(-1)}
                className="hidden size-10 place-items-center rounded-full border border-foodie-line hover:bg-foodie-sage/30 focus-visible:outline-2 focus-visible:outline-foodie-action sm:grid"
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Scroll ${title} right`}
                onClick={() => scroll(1)}
                className="hidden size-10 place-items-center rounded-full border border-foodie-line hover:bg-foodie-sage/30 focus-visible:outline-2 focus-visible:outline-foodie-action sm:grid"
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
      <div
        ref={rail}
        className={
          grid
            ? "grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4"
            : "flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain pt-1 pb-4 [scrollbar-width:thin] sm:gap-5"
        }
      >
        {items.map((item) => (
          <Link
            key={item.menuItemId}
            href={`/kitchens/${item.vendorId}?meal=${item.menuItemId}&from=${encodeURIComponent(returnTo)}`}
            className={`${grid ? "min-w-0" : "w-[70vw] max-w-64 shrink-0 snap-start sm:w-64"} rounded-3xl border border-foodie-line bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foodie-action`}
          >
            <div className="relative aspect-[1.45] overflow-hidden rounded-t-3xl bg-[#eeeadd]">
              <FoodImage src={item.imageUrl} alt={item.name} sizes="256px" />
              {item.kitchen.isDemo && (
                <span className="absolute top-3 left-3 rounded-full bg-foodie-paper/95 px-2 py-1 text-[9px]">
                  Demo
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-medium leading-snug">
                {item.name}
              </h3>
              <p className="mt-1.5 truncate text-[11px] text-foodie-muted">
                {item.kitchen.businessName}
              </p>
              <p className="mt-3 text-sm font-semibold text-foodie-action">
                {formatMealPrice(item)}
              </p>
              {!item.kitchen.isAcceptingOrders && (
                <p className="mt-1 text-[10px] text-foodie-muted">
                  {item.kitchen.isOpen ? "Orders paused" : "Kitchen closed"}
                </p>
              )}
              {!item.isAvailable && (
                <p className="mt-1 text-[10px] text-foodie-muted">
                  Unavailable
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
