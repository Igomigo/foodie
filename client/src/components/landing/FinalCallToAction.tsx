import { Asterisk, Sparkles } from "lucide-react";
import { ActionLink, Eyebrow } from "./ui";
import Reveal from "./Reveal";

export default function FinalCallToAction({
  exploreHref,
}: {
  exploreHref: string;
}) {
  return (
    <section
      aria-labelledby="final-heading"
      className="relative mx-3.5 overflow-hidden rounded-[28px] bg-foodie-orange px-5 py-16 text-center sm:mx-6 sm:py-20 lg:mx-auto lg:max-w-[1300px]"
    >
      <Sparkles
        size={100}
        strokeWidth={1}
        aria-hidden="true"
        className="absolute top-[22%] -left-10 -rotate-12 text-foodie-ink/20 sm:left-[9%]"
      />
      <Reveal className="relative z-10">
        <Eyebrow className="text-[8px] sm:text-[9px]">
          YOUR NEXT GOOD FOOD DAY STARTS HERE.
        </Eyebrow>
        <h2
          id="final-heading"
          className="mt-6 mb-8 text-[clamp(3.5rem,7vw,6.3rem)] leading-[1.04] font-medium tracking-[-.065em]"
        >
          <span lang="pcm">No long talk.</span>
          <br />
          <em className="font-foodie-display font-normal tracking-[-.055em] text-[#fff7df]">
            Just better food.
          </em>
        </h2>
        <ActionLink href={exploreHref} variant="dark">
          Oya, let’s eat
        </ActionLink>
      </Reveal>
      <Asterisk
        size={130}
        strokeWidth={1.2}
        aria-hidden="true"
        className="absolute right-[-6%] bottom-[9%] rotate-12 text-[#fae8c9]/60 sm:right-[8%]"
      />
    </section>
  );
}
