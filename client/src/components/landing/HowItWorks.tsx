import { Flame, Heart, MapPin } from "lucide-react";
import BrandButton from "@/components/shared/BrandButton";
import { Eyebrow } from "./ui";
import Reveal from "./Reveal";

const steps = [
  {
    title: "Start with a craving.",
    description:
      "Something familiar. Something new. There’s no wrong place to start.",
    icon: Flame,
  },
  {
    title: "Find your local favourite.",
    description:
      "Discover the dishes and kitchens that make your neighbourhood taste like home.",
    icon: MapPin,
  },
  {
    title: "Make it a Foodie day.",
    description:
      "Less going in circles over what to eat. More finding a meal worth coming back for.",
    icon: Heart,
  },
];

export default function HowItWorks({ exploreHref }: { exploreHref: string }) {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="mx-3.5 rounded-[28px] bg-foodie-forest text-foodie-paper sm:mx-6 lg:mx-auto lg:max-w-[1300px]"
    >
      <div className="grid gap-12 px-7 py-12 sm:grid-cols-2 sm:gap-12 sm:px-10 lg:gap-24 lg:px-[70px] lg:py-20">
        <Reveal>
          <Eyebrow className="text-[#b5c3a5]">
            GOOD FOOD. LESS OVERTHINKING.
          </Eyebrow>
          <h2
            id="how-heading"
            className="mt-6 text-[clamp(3rem,5vw,4.2rem)] leading-[1.06] font-medium tracking-[-.055em]"
          >
            From craving
            <br />
            <em className="font-foodie-display font-normal text-foodie-sage">
              to first bite.
            </em>
          </h2>
          <p className="mt-6 max-w-[300px] text-xs leading-[1.9] text-[#c0c9bc]">
            For the “what should I eat?” moments.
            <br />
            And the “I know exactly what I want” ones.
          </p>
          <BrandButton href={exploreHref} variant="light" className="mt-8">
            Follow your craving
          </BrandButton>
          <svg
            aria-hidden="true"
            viewBox="0 0 180 80"
            fill="none"
            className="mt-2 ml-auto hidden w-32 -rotate-12 text-foodie-sage lg:block"
          >
            <path
              d="M5 15C53 3 57 72 104 56C123 49 135 30 165 29M150 17L170 28L157 43"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Reveal>
        <ol className="m-0 list-none p-0">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-b border-foodie-paper/15 py-7 first:pt-0 last:border-0 last:pb-0"
            >
              <Reveal
                delay={index * 0.06}
                className="grid grid-cols-[32px_1fr] gap-4 lg:grid-cols-[43px_1fr]"
              >
                <span
                  aria-hidden="true"
                  className="pt-1 font-foodie-display text-[22px] text-[#a3b493] italic"
                >
                  0{index + 1}
                </span>
                <div>
                  <step.icon
                    size={23}
                    strokeWidth={1.5}
                    className="float-right text-foodie-sage"
                    aria-hidden="true"
                  />
                  <h3 className="mt-1 mr-8 text-[17px] font-normal tracking-[-.4px]">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[300px] text-[11px] leading-[1.9] text-[#c0c9bc]">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
