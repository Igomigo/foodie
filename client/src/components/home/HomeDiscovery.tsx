"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DiscoverySearch from "./DiscoverySearch";
import {
  useDiscovery,
  useFoodCategories,
  useDiscoveryFeed,
  useDiscoveryMeals,
} from "@/hooks/useDiscovery";
import type { DiscoverFeature } from "@/data/discover-features";
import MealCollection from "./MealCollection";
import HomeHero from "./HomeHero";
import CravingCategories from "./CravingCategories";
import NearbyKitchens from "./NearbyKitchens";

export default function HomeDiscovery() {
  const params = useSearchParams();
  const q = (params.get("q") || "").slice(0, 80);
  const rawCategory = params.get("category") || "";
  const category =
    rawCategory === "small-chops" ? "bakery-snacks" : rawCategory;
  const view = params.get("view") || "";
  const openOnly = params.get("open") === "1";
  const [debouncedQuery, setDebouncedQuery] = useState(q.trim());
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(q.trim()), 350);
    return () => clearTimeout(timer);
  }, [q]);
  const categories = useFoodCategories();
  const discovery = useDiscovery({ q: debouncedQuery, category, openOnly });
  const browsing = !q.trim() && !category && !view && !openOnly;
  const searchMode = view === "search";
  const searchIdle = searchMode && !q.trim() && !category && !openOnly;
  const waitingForQuery = debouncedQuery !== q.trim();
  const feed = useDiscoveryFeed(browsing);
  const mealResults = useDiscoveryMeals(
    { q: debouncedQuery, category, openOnly },
    !!q.trim() || !!category || openOnly || view === "meals",
  );
  const returnTo = `/home${params.size ? `?${params}` : ""}`;
  function updateFilters(changes: {
    q?: string;
    category?: string;
    open?: string;
    view?: string;
  }) {
    const next = new URLSearchParams(window.location.search);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    window.history.replaceState(
      null,
      "",
      `/home${next.size ? `?${next}` : ""}`,
    );
  }
  function explore(feature: DiscoverFeature) {
    const match = categories.data?.find(
      (entry) =>
        entry.id ===
        (
          {
            "Rice bowls": "rice",
            "Soups & swallows": "soups-swallows",
            "Off the grill": "grills",
            "Bakery & snacks": "bakery-snacks",
          } as Record<string, string>
        )[feature.dish.category],
    );
    updateFilters({ category: match?.id || "", q: feature.search, open: "" });
    document.getElementById("local-kitchens")?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <>
      <h1 className="sr-only">Discover food and kitchens near you</h1>
      <div className={searchMode ? "" : "hidden md:block"}>
        {searchMode && (
          <h2 className="mb-5 text-3xl font-medium tracking-tight md:hidden">
            What are you craving?
          </h2>
        )}
        <DiscoverySearch
          value={q}
          onChange={(value) =>
            updateFilters({ q: value, view: searchMode ? "search" : "" })
          }
        />
      </div>
      {q && !searchMode && (
        <button
          onClick={() => updateFilters({ view: "search" })}
          className="mb-3 min-h-11 text-left text-xs text-foodie-action md:hidden"
        >
          Results for “{q}” · Edit search
        </button>
      )}
      {!view && <HomeHero onExplore={explore} />}
      {view && !searchMode && (
        <button
          onClick={() => updateFilters({ view: "" })}
          className="mt-4 min-h-11 text-xs text-foodie-action underline"
        >
          Back to Discover
        </button>
      )}
      <div className="mt-4 flex items-center gap-3 sm:mt-5">
        <div className="min-w-0 flex-1">
          <CravingCategories
            selected={category}
            categories={feed.data?.categories || categories.data || []}
            allCategories={categories.data || []}
            onSelect={(value) =>
              updateFilters({
                category: value,
                view: searchMode ? "search" : "",
              })
            }
          />
        </div>
        <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-xs text-foodie-muted border-l border-foodie-line pl-3 sm:pl-4">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(event) =>
              updateFilters({ open: event.target.checked ? "1" : "" })
            }
            className="size-4 accent-foodie-action"
          />
          Open now
        </label>
      </div>
      {categories.isError && (
        <p className="mt-2 text-xs text-foodie-muted">
          Categories couldn’t load.{" "}
          <button
            onClick={() => categories.refetch()}
            className="min-h-11 text-foodie-action underline"
          >
            Try again
          </button>
        </p>
      )}
      {searchIdle && (
        <p className="mt-8 text-sm leading-relaxed text-foodie-muted">
          Search a dish or kitchen, or choose a category above. We’ll look
          around your selected address.
        </p>
      )}
      {waitingForQuery && (
        <p role="status" className="mt-8 text-sm text-foodie-muted">
          Finding matches…
        </p>
      )}
      {view !== "meals" && !searchIdle && !waitingForQuery && (
        <NearbyKitchens
          pages={discovery.data?.pages}
          loading={discovery.isPending}
          failed={discovery.isError || discovery.isFetchNextPageError}
          fetching={discovery.isFetching}
          hasMore={!!discovery.hasNextPage}
          preview={browsing}
          categories={categories.data || []}
          filtered={!!(q || category || openOnly)}
          returnTo={`/home${params.size ? `?${params}` : ""}`}
          onRetry={() => discovery.refetch()}
          onMore={() =>
            browsing
              ? updateFilters({ view: "kitchens" })
              : discovery.fetchNextPage()
          }
          onClear={() => updateFilters({ q: "", category: "", open: "" })}
        />
      )}
      {browsing && feed.isPending && (
        <p role="status" className="mt-8 text-xs text-foodie-muted">
          Finding dishes around you…
        </p>
      )}
      {browsing && feed.isError && (
        <p role="alert" className="mt-8 text-xs text-foodie-muted">
          Dishes couldn’t load.{" "}
          <button
            onClick={() => feed.refetch()}
            className="min-h-11 text-foodie-action underline"
          >
            Try again
          </button>
        </p>
      )}
      {browsing && feed.data && (
        <>
          <MealCollection
            title="On the menu near you"
            description="Dishes from kitchens at your selected location."
            items={feed.data.meals.slice(0, 6)}
            returnTo={returnTo}
            onSeeAll={() => updateFilters({ view: "meals" })}
          />
          <MealCollection
            title="Something to try"
            description="A few more dishes for your next craving."
            items={feed.data.meals.slice(6, 12)}
            returnTo={returnTo}
          />
        </>
      )}
      {!browsing && !searchIdle && !waitingForQuery && view !== "kitchens" && (
        <>
          {mealResults.isPending ? (
            <p role="status" className="mt-8 text-sm text-foodie-muted">
              Finding dishes…
            </p>
          ) : mealResults.isError && !mealResults.data ? (
            <p role="alert" className="mt-8 text-sm text-foodie-muted">
              Dishes couldn’t load.{" "}
              <button
                onClick={() => mealResults.refetch()}
                className="min-h-11 text-foodie-action underline"
              >
                Try again
              </button>
            </p>
          ) : mealResults.data?.pages[0]?.items.length ? (
            <MealCollection
              grid
              title={view === "meals" ? "On the menu near you" : "Meals"}
              items={mealResults.data.pages.flatMap((page) => page.items)}
              returnTo={returnTo}
            />
          ) : (
            <p className="mt-8 rounded-2xl border border-foodie-line p-5 text-sm text-foodie-muted">
              No matching dishes at your selected location.
            </p>
          )}
          {mealResults.hasNextPage && (
            <button
              onClick={() => mealResults.fetchNextPage()}
              disabled={mealResults.isFetching}
              className="mt-3 min-h-11 rounded-full border border-foodie-line px-5 text-xs disabled:opacity-50"
            >
              {mealResults.isFetching ? "Loading dishes…" : "More dishes"}
            </button>
          )}
        </>
      )}
    </>
  );
}
