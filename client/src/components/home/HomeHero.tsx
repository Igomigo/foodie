"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  discoverFeatures,
  getDailyDiscoverFeature,
  millisecondsUntilNextFoodDay,
} from "@/data/discover-features";
import { ArrowDownRight } from "lucide-react";
import BrandButton from "@/components/shared/BrandButton";
import { useProfile } from "@/components/app/ProfileContext";

export default function HomeHero() {
  const { user } = useProfile();
  const [feature, setFeature] = useState(discoverFeatures[0]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function updateFeature() {
      const now = new Date();
      setFeature(getDailyDiscoverFeature(now));
      timer = setTimeout(updateFeature, millisecondsUntilNextFoodDay(now));
    }
    updateFeature();
    return () => clearTimeout(timer);
  }, []);
  const name = user?.firstName || user?.username?.split(" ")[0];
  return (
    <section
      aria-labelledby="home-heading"
      className="relative isolate overflow-hidden rounded-[28px] bg-[#eaeedc] sm:rounded-[36px]"
    >
      <div className="grid items-center lg:min-h-[425px] lg:grid-cols-[1.08fr_1fr]">
        <div className="relative z-10 px-7 pt-9 sm:px-10 sm:pt-11 lg:py-11 lg:pl-12 lg:pr-0">
          <p className="flex items-center gap-2 text-[10px] font-medium tracking-[.13em] text-foodie-forest uppercase">
            <span
              className="size-1.5 rounded-full bg-foodie-action"
              aria-hidden="true"
            />
            {name ? `Oya, ${name}.` : "Oya, Foodie."} Let’s eat.
          </p>
          <h1
            id="home-heading"
            lang={feature.language}
            className="mt-5 text-[clamp(2.5rem,4.5vw,4rem)] leading-[1.02] font-medium tracking-[-.065em]"
          >
            {feature.title}
            <br />
            <em className="font-foodie-display font-normal text-foodie-action">
              {feature.accent}
            </em>
          </h1>
          <p
            lang={feature.language}
            className="mt-5 max-w-[350px] text-xs leading-[1.9] text-foodie-forest/75 sm:text-[13px]"
          >
            {feature.foods}
          </p>
          <BrandButton href="#cravings" size="compact" className="mt-7">
            Find my next craving
          </BrandButton>
          <div className="mt-7 hidden items-center gap-3 text-[9px] font-medium tracking-[.12em] text-foodie-forest/65 uppercase lg:flex">
            <span className="h-px w-8 bg-foodie-forest/25" />
            Browse dishes. Find your next meal.
          </div>
        </div>
        <div className="relative h-[275px] sm:h-[335px] lg:h-[425px]">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foodie-forest/10 sm:size-[330px]"
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-[335px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foodie-forest/5 sm:size-[430px]"
          />
          <Image
            key={feature.dish.image}
            src={feature.dish.image}
            alt={feature.dish.alt}
            fill
            priority
            quality={90}
            sizes="(max-width: 1023px) 90vw, 560px"
            className={`drop-shadow-[0_22px_22px_#263c3125] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700 ${feature.imageFit === "cover" ? "object-cover px-3 sm:px-5 lg:px-7" : feature.dish.contain ? "object-contain p-2 sm:p-4 lg:scale-110 lg:p-7" : "rounded-[50%] object-cover p-4 sm:p-6 lg:p-8"}`}
          />
          <div className="absolute right-5 bottom-6 flex items-center gap-3 rounded-2xl border border-white/70 bg-foodie-paper/95 px-4 py-3 shadow-[0_8px_24px_#263c3110] sm:right-8 lg:right-7 lg:bottom-8">
            <span className="font-foodie-display text-2xl italic text-foodie-action">
              Chop life.
            </span>
            <ArrowDownRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
