import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FoodImage from "@/components/shared/FoodImage";
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
      className="group flex overflow-hidden sm:block rounded-3xl border border-foodie-line bg-white/60 transition-shadow hover:shadow-[0_12px_32px_#263c310d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action"
    >
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-[#eeeadd] sm:aspect-[1.8] sm:w-auto">
        <FoodImage
          src={kitchen.bannerUrl || kitchen.imageUrl}
          alt={`Food from ${kitchen.businessName}`}
          sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 390px"
        />
        {kitchen.isDemo && (
          <span className="absolute top-3 left-3 rounded-full bg-foodie-paper/95 px-2.5 py-1 text-[10px] font-medium">
            Demo kitchen
          </span>
        )}
        <span className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-foodie-paper/95 transition-colors group-hover:bg-foodie-sage">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:gap-3">
          <h3 className="text-base leading-tight sm:text-lg font-medium tracking-tight">
            {kitchen.businessName}
          </h3>
          <span
            className={`mt-1 shrink-0 text-[10px] font-medium ${kitchen.isAcceptingOrders ? "text-foodie-forest" : "text-foodie-muted"}`}
          >
            {kitchenStatus(kitchen)}
          </span>
        </div>
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
