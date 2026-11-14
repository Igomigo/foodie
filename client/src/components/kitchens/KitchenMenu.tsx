"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { isAxiosError } from "axios";
import { useFoodCategories, useKitchenMenu } from "@/hooks/useDiscovery";
import {
  formatDistance,
  formatPrice,
  minimumMealPrice,
  kitchenStatus,
} from "@/lib/food-format";
import FoodImage from "@/components/shared/FoodImage";
import type { MenuItem } from "@/types/discovery";
import MealDetails from "./MealDetails";

export default function KitchenMenu({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const menu = useKitchenMenu(id);
  const categories = useFoodCategories();
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const first = menu.data?.pages[0];
  const kitchen = first?.vendor;
  const items = menu.data?.pages.flatMap((page) => page.items) || [];
  const status = isAxiosError(menu.error)
    ? menu.error.response?.status
    : undefined;
  return (
    <>
      <button
        onClick={() => {
          const from = params.get("from");
          if (
            (from === "/home" || from?.startsWith("/home?")) &&
            window.history.length > 1
          )
            router.back();
          else router.push("/home");
        }}
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-xs font-medium text-foodie-muted"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Discover
      </button>
      {menu.isPending ? (
        <div
          role="status"
          aria-label="Loading kitchen menu"
          className="space-y-5 motion-safe:animate-pulse"
        >
          <div className="h-48 rounded-3xl bg-foodie-line/50" />
          <div className="h-8 w-2/3 rounded bg-foodie-line/60" />
        </div>
      ) : !kitchen ? (
        <div role="alert" className="rounded-3xl border border-foodie-line p-8">
          <h1 className="text-2xl font-medium tracking-tight">
            {status === 404
              ? "This kitchen isn’t available here."
              : status === 409
                ? "Add your delivery address."
                : "We couldn’t load this menu."}
          </h1>
          <p className="mt-3 text-sm text-foodie-muted">
            {status === 404
              ? "It may be outside your delivery area or no longer listed."
              : "Check your address or try again in a moment."}
          </p>
          <div className="mt-4 flex flex-wrap gap-5">
            <Link
              href="/settings"
              className="inline-flex min-h-11 items-center text-sm text-foodie-action underline"
            >
              Review address
            </Link>
            {status !== 404 && status !== 409 && (
              <button
                onClick={() => menu.refetch()}
                className="min-h-11 text-sm text-foodie-action underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <header className="overflow-hidden rounded-3xl border border-foodie-line bg-white/60 sm:grid sm:grid-cols-[1fr_1.4fr]">
            <div className="relative aspect-[2.4] bg-[#eeeadd] sm:aspect-auto sm:min-h-60">
              <FoodImage
                src={kitchen.imageUrl}
                alt={`Food from ${kitchen.businessName}`}
                priority
                sizes="(max-width: 639px) 90vw, 480px"
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-[10px] font-semibold tracking-[.1em] text-foodie-action uppercase">
                {kitchenStatus(kitchen)}
                {kitchen.isDemo && " · Demo kitchen"}
              </p>
              <h1 className="mt-3 text-3xl leading-tight font-medium tracking-[-.045em] sm:text-4xl">
                {kitchen.businessName}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-foodie-muted">
                {kitchen.description}
              </p>
              <p className="mt-4 flex items-center gap-2 text-xs text-foodie-muted">
                <MapPin size={15} aria-hidden="true" />
                {kitchen.address.area || kitchen.address.city}
                {kitchen.distanceMeters !== null &&
                  ` · ${formatDistance(kitchen.distanceMeters)}`}
              </p>
            </div>
          </header>
          {first.mode === "city" && (
            <p className="mt-4 rounded-2xl bg-foodie-sage/30 p-4 text-sm text-foodie-muted">
              You’re browsing a city menu.{" "}
              <Link href="/settings" className="text-foodie-action underline">
                Confirm your address
              </Link>{" "}
              to check delivery coverage.
            </p>
          )}
          {!kitchen.isAcceptingOrders && (
            <p className="mt-4 text-sm text-foodie-muted">
              {kitchen.isOpen
                ? "This kitchen has paused orders. You can still browse the menu."
                : "This kitchen is closed right now. You can still browse the menu."}
            </p>
          )}
          {kitchen.isDemo && (
            <p className="mt-4 text-xs leading-relaxed text-foodie-muted">
              A fictional kitchen for testing. Menu items and prices are
              samples.
            </p>
          )}
          <div className="mt-8 mb-5 flex items-baseline justify-between">
            <h2 className="text-2xl font-medium tracking-tight">On the menu</h2>
            <span className="text-xs text-foodie-muted">Prices in NGN</span>
          </div>
          {!items.length && (
            <p className="rounded-2xl border border-foodie-line p-6 text-sm text-foodie-muted">
              No published dishes are available right now.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <button
                key={item.menuItemId}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setSelected(item);
                }}
                className="group flex min-w-0 gap-4 rounded-3xl border border-foodie-line bg-white/60 p-4 text-left transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foodie-action"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium tracking-wide text-foodie-muted uppercase">
                    {
                      categories.data?.find(
                        (entry) => entry.id === item.category,
                      )?.name
                    }
                  </p>
                  <h3 className="mt-1 text-base leading-snug font-medium tracking-tight">
                    {item.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foodie-muted">
                    {item.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-foodie-action">
                    {item.options.some(
                      (option) =>
                        option.minSelections > 0 &&
                        option.choices.some((choice) => choice.price > 0),
                    ) && "From "}
                    {formatPrice(minimumMealPrice(item))}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-foodie-muted">
                    {item.isAvailable
                      ? "View meal"
                      : "Unavailable · view details"}
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </p>
                </div>
                <div className="relative size-24 shrink-0 self-center overflow-hidden rounded-2xl bg-[#eeeadd] sm:size-28">
                  <FoodImage
                    src={item.imageUrl}
                    alt={item.name}
                    sizes="112px"
                  />
                </div>
              </button>
            ))}
          </div>
          {menu.isError && (
            <p role="alert" className="mt-5 text-sm text-foodie-action">
              Couldn’t refresh the menu.{" "}
              <button
                onClick={() => menu.refetch()}
                className="min-h-11 underline"
              >
                Try again
              </button>
            </p>
          )}
          {menu.hasNextPage && (
            <div className="mt-6 text-center">
              <button
                onClick={() => menu.fetchNextPage()}
                disabled={menu.isFetching}
                className="min-h-11 rounded-full border border-foodie-line px-6 text-xs font-medium disabled:opacity-50"
              >
                {menu.isFetching ? "Loading dishes…" : "More dishes"}
              </button>
            </div>
          )}
        </>
      )}
      <MealDetails
        item={selected}
        onClose={() => setSelected(null)}
        onRestoreFocus={() => trigger.current?.focus({ preventScroll: true })}
      />
    </>
  );
}
