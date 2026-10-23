import Image from "next/image";
import {
  ArrowDown,
  ArrowDownRight,
  Asterisk,
  Flame,
  Heart,
  MapPin,
} from "lucide-react";
import { ActionLink, Eyebrow } from "./ui";
import Reveal from "./Reveal";

export default function HeroSection({ exploreHref }: { exploreHref: string }) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative mx-auto grid max-w-[1360px] items-center gap-8 px-6 pt-12 pb-20 md:min-h-[650px] md:grid-cols-2 md:gap-4 md:px-10 md:pt-16 md:pb-24 lg:min-h-[750px] lg:gap-6 lg:px-14"
    >
      <Reveal className="relative z-10 min-w-0">
        <Eyebrow className="flex items-center gap-2.5 text-foodie-muted">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-foodie-orange ring-4 ring-foodie-orange/8"
          />
          HOME IS A FLAVOUR.
        </Eyebrow>
        <h1
          id="hero-heading"
          className="mt-6 mb-6 text-[clamp(3.3rem,15.2vw,6rem)] leading-[1.04] font-medium tracking-[-.065em] md:text-[clamp(4.4rem,7.5vw,7rem)]"
        >
          <span lang="pcm" className="whitespace-nowrap">
            Wetin you
            <br />
            <em className="font-foodie-display font-normal tracking-[-.055em] text-foodie-orange">
              wan chop?
            </em>
          </span>
        </h1>
        <p className="max-w-[355px] text-[13px] leading-[1.9] text-foodie-muted lg:text-sm">
          Smoky party jollof. A proper bowl of egusi. That suya craving. Find
          the food that feels like home.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-5">
          <ActionLink href={exploreHref}>Find my next meal</ActionLink>
          <a
            href="#cravings"
            className="group inline-flex min-h-11 items-center gap-2 text-[11px] font-medium"
          >
            A little inspiration
            <ArrowDownRight
              size={18}
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover:translate-x-1"
            />
          </a>
        </div>
        <div className="mt-8 flex items-center gap-3 lg:mt-10">
          <span className="grid size-9 place-items-center rounded-full border border-foodie-line">
            <MapPin size={15} aria-hidden="true" />
          </span>
          <p className="text-[10px] leading-relaxed text-foodie-muted">
            Our food. Our people.
            <br />
            <span className="font-medium text-foodie-ink">
              A little closer to home.
            </span>
          </p>
        </div>
      </Reveal>

      <Reveal
        className="relative mx-auto mt-3 aspect-square w-full max-w-[540px] md:mt-0 md:max-w-none"
        delay={0.12}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 bottom-[3%] scale-y-90 -rotate-[24deg] rounded-full border border-[#c9cbbd]"
        />
        <div
          aria-hidden="true"
          className="absolute top-[7%] left-[9%] aspect-square w-[89%] rounded-full bg-foodie-orange"
        />
        <Asterisk
          aria-hidden="true"
          className="absolute top-[3%] -left-[1%] size-12 rotate-12 text-[#505d40] lg:size-16"
          strokeWidth={1.1}
        />
        <Image
          src="/images/landing-jollof.png"
          alt="Nigerian jollof rice with grilled chicken and golden dodo in a ceramic bowl"
          width={1100}
          height={1100}
          sizes="(max-width: 767px) 100vw, (max-width: 1100px) 52vw, 650px"
          priority
          className="absolute -top-[3%] -left-[2%] h-auto w-[108%] max-w-none -rotate-[9deg] drop-shadow-[0_22px_19px_#3c241a28]"
        />
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 z-10 flex size-[86px] rotate-12 flex-col items-center justify-center gap-1.5 rounded-full bg-foodie-forest text-foodie-paper outline outline-offset-[-8px] outline-dashed outline-foodie-paper/40 lg:size-[106px]"
        >
          <span className="text-[7px] font-semibold tracking-[1.5px]">
            NAIJA TO THE
          </span>
          <Heart size={20} strokeWidth={1.3} />
          <span className="text-[7px] font-semibold tracking-[1.5px]">
            LAST BITE.
          </span>
        </div>
        <div className="absolute bottom-[3%] -left-[1%] z-10 flex -rotate-5 items-center gap-3 rounded-2xl bg-[#fffdf6]/95 p-3.5 shadow-[0_10px_40px_#362f2215] backdrop-blur-sm lg:-left-[4%] lg:p-4.5">
          <span className="grid size-9 place-items-center rounded-full bg-[#fae5d8] text-foodie-action">
            <Flame size={20} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <p className="text-[10px] leading-relaxed text-foodie-muted">
            Jollof, chicken & dodo.
            <br />
            <strong
              lang="pcm"
              className="text-xs font-semibold text-foodie-ink"
            >
              This one na correct combo.
            </strong>
          </p>
        </div>
        <p className="absolute -bottom-[10%] right-[2%] text-right text-[10px] leading-relaxed text-foodie-muted lg:-bottom-[7%]">
          Some combinations just make sense.
          <br />
          <em className="font-foodie-display text-xs">
            This is definitely one of them.
          </em>
        </p>
      </Reveal>
      <a
        href="#cravings"
        aria-label="Explore food inspiration"
        className="absolute bottom-3 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full border border-foodie-line text-foodie-muted md:bottom-5"
      >
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
