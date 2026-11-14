"use client";
import Link from "next/link";
import { MapPin, Store } from "lucide-react";
import type { FoodCategory, KitchenResults } from "@/types/discovery";
import KitchenCard from "./KitchenCard";

export default function NearbyKitchens({
  pages,
  loading,
  failed,
  fetching,
  hasMore,
  categories,
  filtered,
  returnTo,
  onRetry,
  onMore,
  onClear,
  preview = false,
}: {
  pages?: KitchenResults[];
  loading: boolean;
  failed: boolean;
  fetching: boolean;
  hasMore: boolean;
  categories: FoodCategory[];
  filtered: boolean;
  returnTo: string;
  onRetry: () => void;
  onMore: () => void;
  onClear: () => void;
  preview?: boolean;
}) {
  const first = pages?.[0];
  const allKitchens = pages?.flatMap((page) => page.items) ?? [];
  const kitchens = preview ? allKitchens.slice(0, 6) : allKitchens;
  const locationRequired = first?.mode === "location-required";
  return (
    <section
      id="local-kitchens"
      aria-labelledby="nearby-heading"
      className="scroll-mt-28 pt-5"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="nearby-heading"
          className="text-xl font-medium tracking-[-.035em] sm:text-2xl"
        >
          {first?.mode === "city"
            ? `Kitchens in ${first.city}`
            : "Kitchens near you"}
        </h2>
        <span className="text-[10px] text-foodie-muted">
          {first?.mode === "nearby"
            ? "Taking orders first · then nearest"
            : "Made for your next craving"}
        </span>
      </div>
      {first?.mode === "city" && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl border border-foodie-line bg-white/50 p-4 text-xs leading-relaxed text-foodie-muted">
          <MapPin size={17} className="shrink-0" aria-hidden="true" />
          <span>
            Browsing your city.{" "}
            <Link
              href="/settings"
              className="font-medium text-foodie-action underline underline-offset-4"
            >
              Confirm your address
            </Link>{" "}
            to find kitchens that deliver to you.
          </span>
        </p>
      )}
      {loading ? (
        <div
          role="status"
          aria-label="Finding kitchens"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="overflow-hidden rounded-3xl border border-foodie-line motion-safe:animate-pulse"
            >
              <div className="aspect-[2/1] bg-foodie-line/50" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 rounded bg-foodie-line/60" />
                <div className="h-3 w-1/2 rounded bg-foodie-line/40" />
              </div>
            </div>
          ))}
        </div>
      ) : failed && !pages ? (
        <div role="alert" className="rounded-3xl border border-foodie-line p-7">
          <h3 className="font-medium">We couldn’t load the kitchens.</h3>
          <p className="mt-2 text-sm text-foodie-muted">
            Check your connection and try again.
          </p>
          <button
            onClick={onRetry}
            className="mt-3 min-h-11 text-sm font-semibold text-foodie-action underline"
          >
            Try again
          </button>
        </div>
      ) : locationRequired || !kitchens.length ? (
        <div className="rounded-3xl border border-dashed border-foodie-forest/20 bg-[#eef0e6] p-7">
          <Store
            className="mb-4 text-foodie-forest/60"
            size={28}
            strokeWidth={1.3}
            aria-hidden="true"
          />
          <h3 className="text-xl font-medium tracking-tight">
            {locationRequired
              ? "Where are we eating?"
              : filtered
                ? "Let’s try another craving."
                : first?.mode === "city"
                  ? "No kitchens listed here yet."
                  : "No kitchens deliver here yet."}
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-foodie-muted">
            {locationRequired
              ? "Add your delivery address to discover kitchens around you."
              : filtered
                ? "No kitchens match these filters at your selected location."
                : "Try another delivery address in Settings. We’ll keep your results local."}
          </p>
          {filtered && !locationRequired ? (
            <button
              onClick={onClear}
              className="mt-3 min-h-11 text-xs font-semibold text-foodie-action underline"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/settings"
              className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-foodie-action underline"
            >
              {locationRequired ? "Add an address" : "Review your address"}
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {kitchens.map((kitchen, index) => (
              <div
                key={kitchen.vendorId}
                className={preview && index >= 3 ? "hidden sm:block" : ""}
              >
                <KitchenCard
                  kitchen={kitchen}
                  categories={categories}
                  returnTo={returnTo}
                />
              </div>
            ))}
          </div>
          {first?.mode === "nearby" && (
            <p className="mt-4 text-[10px] text-foodie-muted">
              Distances are approximate, measured in a straight line.
            </p>
          )}
          {kitchens.some((kitchen) => kitchen.isDemo) && (
            <p className="mt-2 text-[10px] text-foodie-muted">
              Demo kitchens are fictional businesses for testing. Their menus
              and prices are samples.
            </p>
          )}
          {failed && (
            <p role="alert" className="mt-4 text-sm text-foodie-action">
              Couldn’t refresh these results.{" "}
              <button onClick={onRetry} className="min-h-11 underline">
                Try again
              </button>
            </p>
          )}
          {(hasMore || (preview && allKitchens.length > 3)) && (
            <div className="mt-6 text-center">
              <button
                disabled={fetching}
                onClick={onMore}
                className="min-h-11 rounded-full border border-foodie-line bg-white px-6 text-xs font-medium disabled:opacity-50"
              >
                {fetching
                  ? "Loading kitchens…"
                  : preview
                    ? "See all kitchens"
                    : "More kitchens"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
