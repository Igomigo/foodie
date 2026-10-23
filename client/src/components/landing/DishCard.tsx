import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { Dish } from "@/data/food-inspiration";

export default function DishCard({
  dish,
  index,
  onOpen,
}: {
  dish: Dish;
  index: number;
  onOpen: (dish: Dish, trigger: HTMLButtonElement) => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.article
      initial={reducedMotion ? false : { y: 18 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.55,
        delay: Math.min(index, 4) * 0.045,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group min-w-0 basis-[85%] shrink-0 snap-start sm:basis-[46%] lg:basis-[31%]"
    >
      <button
        type="button"
        onClick={(event) => onOpen(dish, event.currentTarget)}
        aria-label={`Explore ${dish.name}`}
        className={cn(
          "relative isolate block aspect-[1.1] w-full overflow-hidden rounded-[22px] bg-[#ede8dc] text-left shadow-[0_4px_12px_#24291f04] transition-[rotate,translate,box-shadow] duration-500 hover:shadow-[0_16px_30px_#24291f12] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:rotate-0 motion-safe:group-focus-within:rotate-0",
          index % 2 === 0
            ? "motion-safe:rotate-[-.8deg]"
            : "motion-safe:rotate-[.8deg]",
        )}
      >
        <Image
          src={dish.image}
          quality={90}
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
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-4 rounded-full bg-foodie-paper/95 px-3 py-2 text-[9px] font-medium opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          Take a closer look
        </span>
      </button>
      <div className="mt-5 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="pt-0.5 font-foodie-display text-lg italic leading-none text-foodie-action/70 tabular-nums"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="text-[17px] leading-snug font-medium tracking-[-.4px]">
            {dish.name}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-foodie-muted">
            {dish.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
