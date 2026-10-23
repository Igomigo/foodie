import Image from "next/image";
import { Asterisk } from "lucide-react";
import BrandButton from "@/components/shared/BrandButton";
import { Eyebrow } from "./ui";
import Reveal from "./Reveal";

export default function VendorSection() {
  return (
    <section
      id="for-the-cooks"
      aria-labelledby="vendor-heading"
      className="mx-auto grid max-w-[1260px] items-center gap-14 px-6 py-20 sm:grid-cols-2 sm:gap-14 sm:px-10 lg:gap-24 lg:px-14 lg:py-28"
    >
      <Reveal className="relative min-h-[370px] sm:min-h-[400px] lg:min-h-[435px]">
        <Image
          src="/images/african-food-vendors.jpeg"
          alt="A smiling local cook preparing food on an outdoor grill"
          fill
          sizes="(max-width: 639px) 90vw, 46vw"
          className="rounded-[22px] object-cover object-[53%_center]"
        />
        <div className="absolute -right-2 -bottom-5 rotate-5 rounded-sm border border-[#d8dfb6] bg-[#e9edcf] py-5 pr-16 pl-6 shadow-[0_7px_15px_#37462b0a] lg:-right-7">
          <Eyebrow className="text-[8px]">THE HANDS BEHIND</Eyebrow>
          <p className="mt-1 font-foodie-display text-[27px] tracking-[-1px] italic">
            the good stuff.
          </p>
          <Asterisk
            size={33}
            strokeWidth={1.2}
            aria-hidden="true"
            className="absolute top-7 right-4"
          />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <Eyebrow className="max-w-[320px] text-[9px] text-foodie-muted">
          FOR THE COOKS. THE FLAVOUR MAKERS.
        </Eyebrow>
        <h2
          id="vendor-heading"
          className="mt-5 text-[clamp(2.6rem,4.2vw,3.5rem)] leading-[1.1] font-medium tracking-[-.055em]"
        >
          Your food.
          <br />
          <em className="font-foodie-display font-normal text-[#737e56]">
            Their new
            <br />
            favourite.
          </em>
        </h2>
        <p className="mt-6 max-w-[320px] text-xs leading-[1.9] text-foodie-muted">
          You bring the flavour. We’ll help more people find it. Give your
          kitchen a home on Foodie.
        </p>
        <BrandButton
          href="/auth/vendor-signup"
          variant="outline"
          className="mt-7 gap-4 text-[11px]"
        >
          Bring your kitchen to Foodie
        </BrandButton>
      </Reveal>
    </section>
  );
}
