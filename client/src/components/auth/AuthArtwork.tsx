"use client";

import Image from "next/image";
import { Asterisk, Heart, MapPin } from "lucide-react";
import Brand from "@/components/Brand";
import { usePathname } from "next/dist/client/components/navigation";

export default function AuthArtwork() {
  const route = usePathname();

  return (
    <aside className="relative hidden min-h-[740px] overflow-hidden rounded-[28px] bg-foodie-forest text-foodie-paper lg:sticky lg:top-4 lg:flex lg:h-[calc(100svh-32px)] lg:max-h-[1100px] lg:flex-col">
      <div className="relative z-10 px-10 pt-9 xl:px-13">
        <Brand className="text-foodie-paper" />
        <p className="mt-17 text-[9px] tracking-[.22em] text-foodie-sage uppercase">
          Our food. Our people.
        </p>
        <h2 className="mt-5 text-[clamp(3.3rem,4.6vw,5.2rem)] leading-[1.02] tracking-[-.06em]">
          A little closer
          <br />
          <em className="font-foodie-display font-normal text-foodie-sage">
            to home.
          </em>
        </h2>
        <p className="mt-5 max-w-[285px] text-xs leading-[1.9] text-foodie-paper/65">
          The smoky jollof. The extra dodo. The kitchen you’ll tell your friends
          about.
        </p>
      </div>
      <div className="relative mt-4 min-h-[350px] flex-1" aria-hidden="true">
        <div className="absolute top-[5%] -left-[12%] aspect-square w-[95%] rounded-full border border-foodie-sage/20" />
        <div className="absolute top-[13%] -left-[5%] aspect-square w-[85%] rounded-full bg-[#df7953]" />
        <Image
          src={route === "/auth/signup" ? "/images/landing-jollof.png" : "/images/foodie-rice-stew.png"}
          alt=""
          width={800}
          height={800}
          priority
          sizes="50vw"
          className="absolute -top-[2%] -left-[13%] w-[105%] max-w-none -rotate-[18deg] drop-shadow-[0_22px_24px_#101a1470]"
        />
        <Asterisk
          strokeWidth={1}
          className="absolute top-3 right-[9%] size-16 rotate-12 text-foodie-sage"
        />
        <div className="absolute top-[32%] right-5 z-10 w-[138px] rotate-8 rounded-xl bg-foodie-paper p-2.5 pb-4 text-foodie-ink shadow-xl xl:right-8 xl:w-[160px]">
          <Image
            src={route === "/auth/signup" ? "/images/foodie-egusi-eba.png" : "/images/foodie-oha.png"}
            alt=""
            width={180}
            height={160}
            sizes="160px"
            className="aspect-[1.1] rounded-md object-cover"
          />
          <p className="mt-3 font-foodie-display text-lg leading-none italic">
            Chop life.
          </p>
          <p className="mt-1.5 text-[8px] text-foodie-muted">
            One good meal at a time.
          </p>
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-between gap-4 border-t border-foodie-paper/15 bg-foodie-forest/95 px-10 py-6 text-[9px] text-foodie-paper/80 xl:px-13">
        <span className="flex items-center gap-2">
          <MapPin size={13} />
          Rooted in Nigeria.
        </span>
        <span className="flex items-center gap-2">
          Made for your appetite.
          <Heart size={13} />
        </span>
      </div>
    </aside>
  );
}
