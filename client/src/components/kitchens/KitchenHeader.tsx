"use client";
import { ArrowLeft, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KitchenBanner,
  KitchenLogo,
} from "@/components/shared/KitchenBranding";
import KitchenHours from "./KitchenHours";
import { formatDistance, kitchenStatus } from "@/lib/food-format";
import type { Kitchen } from "@/types/discovery";

export default function KitchenHeader({ kitchen }: { kitchen: Kitchen }) {
  const router = useRouter();
  const params = useSearchParams();
  function goBack() {
    const from = params.get("from");
    if (
      (from === "/home" || from?.startsWith("/home?")) &&
      window.history.length > 1
    )
      router.back();
    else router.push("/home");
  }
  return (
    <header>
      <div className="relative sm:overflow-hidden sm:rounded-[32px]">
        <KitchenBanner
          src={kitchen.bannerUrl}
          name={kitchen.businessName}
          priority
          className="h-48 sm:h-64 lg:h-72"
        />
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back"
          className="absolute top-[max(16px,env(safe-area-inset-top))] left-5 grid size-11 place-items-center rounded-full border border-white/60 bg-foodie-paper/95 text-foodie-ink shadow-sm backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action sm:top-5 sm:left-6"
        >
          <ArrowLeft size={21} aria-hidden="true" />
        </button>
      </div>
      <div className="relative z-10 mx-auto -mt-11 w-fit sm:-mt-13">
        <KitchenLogo src={kitchen.logoUrl} name={kitchen.businessName} />
      </div>
      <div className="mx-auto max-w-2xl px-6 pt-3 text-center sm:pt-4">
        <p className="text-[10px] font-semibold tracking-[.1em] text-foodie-action uppercase">
          {kitchenStatus(kitchen)}
        </p>
        <h1 className="mt-2 text-[clamp(1.875rem,4vw,2.75rem)] leading-tight font-medium tracking-[-.055em]">
          {kitchen.businessName}
        </h1>
        {kitchen.description && (
          <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-foodie-muted">
            {kitchen.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 text-xs text-foodie-muted">
          <p className="flex min-h-9 items-center gap-1.5">
            <MapPin size={13} aria-hidden="true" />
            {kitchen.address.area || kitchen.address.city}
            {kitchen.distanceMeters !== null &&
              ` · ${formatDistance(kitchen.distanceMeters)}`}
          </p>
          <KitchenHours hours={kitchen.openingHours ?? []} />
        </div>
      </div>
    </header>
  );
}
