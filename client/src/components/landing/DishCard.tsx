import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dish } from "./dishes";

export default function DishCard({
  dish,
  onOpen,
}: {
  dish: Dish;
  onOpen: (dish: Dish, trigger: HTMLButtonElement) => void;
}) {
  return (
    <article className="group min-w-0 basis-[85%] shrink-0 snap-start sm:basis-[46%] lg:basis-[31%]">
      <button
        type="button"
        onClick={(event) => onOpen(dish, event.currentTarget)}
        aria-label={`Explore ${dish.name}`}
        className="relative isolate block aspect-[1.1] w-full overflow-hidden rounded-[22px] bg-[#ede8dc] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action"
      >
        <Image
          src={dish.image}
          alt={dish.alt}
          fill
          sizes="(max-width: 639px) 85vw, (max-width: 1023px) 46vw, 400px"
          className={cn(
            "object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.045]",
            dish.contain && "object-contain p-3",
          )}
        />
        <span className="absolute top-4 left-4 rounded-md bg-foodie-paper/95 px-3 py-2 text-[8px] font-semibold tracking-[.12em] backdrop-blur-sm">
          {dish.label}
        </span>
        <span className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full bg-foodie-paper text-foodie-ink transition-[background-color,transform] duration-300 group-hover:bg-foodie-sage motion-safe:group-hover:rotate-45">
          <ArrowUpRight size={23} aria-hidden="true" />
        </span>
      </button>
      <h3 className="mt-5 text-[17px] leading-snug font-medium tracking-[-.4px]">
        {dish.name}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-foodie-muted">
        {dish.description}
      </p>
    </article>
  );
}
