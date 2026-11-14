import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  KitchenBanner,
  KitchenLogo,
} from "@/components/shared/KitchenBranding";
import { formatDistance, kitchenStatus } from "@/lib/food-format";
import type { FoodCategory, Kitchen } from "@/types/discovery";

export default function KitchenCard({
  kitchen,
  categories,
  returnTo,
}: {
  kitchen: Kitchen;
  categories: FoodCategory[];
  returnTo: string;
}) {
  return (
    <Link
      href={`/kitchens/${kitchen.vendorId}?from=${encodeURIComponent(returnTo)}`}
      className="group block overflow-hidden rounded-3xl border border-foodie-line bg-white/60 transition-shadow hover:shadow-[0_12px_32px_#263c3110] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action"
    >
      <div className="relative">
        <KitchenBanner
          src={kitchen.bannerUrl}
          name={kitchen.businessName}
          className="aspect-[2.5] sm:aspect-[2.4]"
          sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 400px"
        />
        <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-foodie-paper/90 transition-colors group-hover:bg-white">
          <ArrowUpRight size={17} aria-hidden="true" />
        </span>
      </div>
      <div className="relative px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
        <div className="-mt-10 mb-2 flex items-end justify-between gap-3">
          <KitchenLogo
            src={kitchen.logoUrl}
            name={kitchen.businessName}
            className="size-14 border-4 text-lg sm:size-16"
          />
          <span
            className={`mb-1 rounded-full px-2.5 py-1.5 text-[10px] font-medium ${kitchen.isAcceptingOrders ? "bg-foodie-sage/30 text-foodie-forest" : "bg-foodie-line/40 text-foodie-muted"}`}
          >
            {kitchenStatus(kitchen)}
          </span>
        </div>
        <h3 className="text-lg leading-tight font-medium tracking-tight">
          {kitchen.businessName}
        </h3>
        <p className="mt-2 text-xs text-foodie-muted">
          {kitchen.address.area || kitchen.address.city}
          {kitchen.distanceMeters !== null &&
            ` · ${formatDistance(kitchen.distanceMeters)}`}
        </p>
        <p className="mt-2 truncate text-[11px] text-foodie-muted">
          {categories
            .filter((category) => kitchen.categories.includes(category.id))
            .map((category) => category.name)
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}
