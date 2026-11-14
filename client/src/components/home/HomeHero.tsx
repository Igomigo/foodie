"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  discoverFeatures,
  getDailyDiscoverFeature,
  millisecondsUntilNextFoodDay,
} from "@/data/discover-features";
import type { DiscoverFeature } from "@/data/discover-features";

export default function HomeHero({
  onExplore,
}: {
  onExplore: (feature: DiscoverFeature) => void;
}) {
  const [feature, setFeature] = useState(discoverFeatures[0]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function update() {
      const now = new Date();
      setFeature(getDailyDiscoverFeature(now));
      timer = setTimeout(update, millisecondsUntilNextFoodDay(now));
    }
    update();
    return () => clearTimeout(timer);
  }, []);
  return (
    <section
      aria-label="Today's food inspiration"
      className="relative isolate mt-5 overflow-hidden rounded-3xl bg-[#eaeedc] sm:mt-6"
    >
      <div className="relative z-10 w-[64%] py-4 pl-5 sm:w-[65%] sm:py-6 sm:pl-8">
        <p className="text-[9px] font-semibold tracking-[.14em] text-foodie-forest/65 uppercase">
          Today’s pick
        </p>
        <h2
          lang={feature.language}
          className="mt-2 text-[clamp(1.375rem,3vw,2.25rem)] leading-[1.05] font-medium tracking-[-.045em]"
        >
          {feature.title}{" "}
          <em className="block font-foodie-display font-normal text-foodie-action sm:inline">
            {feature.accent}
          </em>
        </h2>
        <p
          lang={feature.language}
          className="mt-2 hidden max-w-md text-xs leading-relaxed text-foodie-forest/75 md:block"
        >
          {feature.foods}
        </p>
        <button
          type="button"
          onClick={() => onExplore(feature)}
          className="mt-2 inline-flex min-h-11 items-center gap-2 text-[11px] font-semibold text-foodie-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foodie-action"
        >
          Find my next craving <ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 w-[38%] overflow-hidden sm:w-[32%]">
        <Image
          key={feature.dish.image}
          src={feature.dish.image}
          alt={feature.dish.alt}
          fill
          priority
          quality={90}
          sizes="(max-width: 640px) 140px, 360px"
          className={
            feature.imageFit === "cover"
              ? "object-cover [mask-image:linear-gradient(to_right,transparent,black_22%)]"
              : "object-contain p-1 drop-shadow-lg sm:p-3"
          }
        />
      </div>
    </section>
  );
}
