"use client";

import { Store } from "lucide-react";
import { useProfile } from "@/components/app/ProfileContext";

export default function NearbyKitchens() {
  const { user } = useProfile();
  const location = user?.location;
  return (
    <section
      id="local-kitchens"
      aria-labelledby="nearby-heading"
      className="scroll-mt-32 border-t border-foodie-line pt-9"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[9px] font-semibold tracking-[.16em] text-foodie-action uppercase">
            Good food, closer
          </p>
          <h2
            id="nearby-heading"
            className="text-2xl font-medium tracking-[-.04em] sm:text-3xl"
          >
            From your neighbourhood.
          </h2>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-start gap-5 rounded-3xl border border-dashed border-foodie-forest/20 bg-[#eef0e6] p-7 sm:flex-row sm:items-center sm:p-8">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-foodie-paper text-foodie-forest">
          <Store size={30} strokeWidth={1.2} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-medium tracking-tight">
            Your local food scene is coming.
          </h3>
          <p className="mt-2 max-w-[590px] text-xs leading-[1.9] text-foodie-muted">
            No kitchen menus are available
            {location?.city ? ` in ${location.city}` : " here"} yet. We’re
            getting things ready. In the meantime, find your next craving above.
          </p>
        </div>
      </div>
    </section>
  );
}
