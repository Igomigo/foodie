import Image from "next/image";
import { MapPin, Utensils } from "lucide-react";

export default function LocationArtwork() {
  return (
    <aside
      className="relative hidden min-h-[650px] overflow-hidden bg-foodie-forest px-10 py-12 text-foodie-paper lg:block xl:px-12"
      aria-label="Foodie, rooted in Nigeria"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-foodie-paper/20 px-3 py-2 text-[9px] tracking-[.15em] uppercase">
        <MapPin size={12} className="text-foodie-sage" />
        Made for your corner.
      </span>
      <h2 className="relative z-10 mt-12 text-[clamp(2.4rem,3.6vw,3rem)] leading-[1.04] tracking-[-.055em]">
        Your street.
        <br />
        <em className="font-foodie-display font-normal text-foodie-sage">
          Your kind of food.
        </em>
      </h2>
      <div
        aria-hidden="true"
        className="absolute top-[43%] -left-[17%] aspect-square w-[110%] rounded-full border border-foodie-sage/20"
      />
      <div
        aria-hidden="true"
        className="absolute top-[49%] -left-[12%] aspect-square w-[94%] rounded-full bg-foodie-orange/90"
      />
      <Image
        src="/images/landing-jollof.png"
        alt="A bowl of Nigerian party jollof rice"
        width={800}
        height={800}
        sizes="(min-width: 1024px) 45vw, 0px"
        className="absolute top-[44%] -left-[17%] w-[111%] max-w-none -rotate-12 drop-shadow-[0_24px_24px_#10241760]"
        priority
      />
      <div className="absolute right-8 bottom-10 z-10 flex max-w-48 items-center gap-3 rounded-2xl border border-white/65 bg-foodie-paper p-4 text-foodie-forest shadow-lg">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foodie-sage/50">
          <Utensils size={16} strokeWidth={1.5} />
        </span>
        <span className="text-[11px] leading-relaxed">
          The next good meal
          <br />
          <span className="font-foodie-display text-lg italic">
            starts here.
          </span>
        </span>
      </div>
    </aside>
  );
}
