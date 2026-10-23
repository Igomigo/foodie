"use client";

import { useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeroBowl() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="absolute inset-0">
      <div
        className={cn(
          "absolute -top-[3%] -left-[2%] aspect-square w-[108%] motion-safe:animate-[spin_100s_linear_infinite] group-hover/bowl:[animation-play-state:paused] group-focus-within/bowl:[animation-play-state:paused]",
          paused && "[animation-play-state:paused]",
        )}
      >
        <Image
          src="/images/landing-jollof.png"
          alt="Nigerian jollof rice with grilled chicken and golden dodo in a ceramic bowl"
          width={1100}
          height={1100}
          sizes="(max-width: 767px) 100vw, (max-width: 1100px) 52vw, 650px"
          priority
          className="h-auto w-full -rotate-[9deg] drop-shadow-[0_22px_19px_#3c241a28]"
        />
      </div>
      <button
        type="button"
        aria-label={paused ? "Resume bowl animation" : "Pause bowl animation"}
        onClick={() => setPaused((current) => !current)}
        className="absolute right-2 bottom-[7%] z-20 grid size-11 place-items-center rounded-full border border-foodie-paper/80 bg-foodie-paper/90 text-foodie-ink shadow-sm backdrop-blur-sm transition-colors hover:bg-foodie-sage focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action motion-reduce:hidden"
      >
        {paused ? (
          <Play size={14} aria-hidden="true" />
        ) : (
          <Pause size={14} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
