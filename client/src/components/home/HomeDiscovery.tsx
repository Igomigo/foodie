"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDiscovery, useFoodCategories } from "@/hooks/useDiscovery";
import type { DiscoverFeature } from "@/data/discover-features";
import HomeHero from "./HomeHero";
import CravingCategories from "./CravingCategories";
import NearbyKitchens from "./NearbyKitchens";

export default function HomeDiscovery() {
  const params = useSearchParams();
  const q = (params.get("q") || "").slice(0, 80);
  const category = params.get("category") || "";
  const openOnly = params.get("open") === "1";
  const [debouncedQuery, setDebouncedQuery] = useState(q);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(q.trim()), 350);
    return () => clearTimeout(timer);
  }, [q]);
  const categories = useFoodCategories();
  const discovery = useDiscovery({ q: debouncedQuery, category, openOnly });
  function updateFilters(changes: {
    q?: string;
    category?: string;
    open?: string;
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
        entry.name.toLowerCase() === feature.dish.category.toLowerCase(),
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
      <div className="relative mx-auto max-w-2xl">
        <label htmlFor="food-search" className="sr-only">
          Search meals or kitchens
        </label>
        <Search
          size={19}
          aria-hidden="true"
          className="absolute top-4 left-4 text-foodie-muted"
        />
        <input
          id="food-search"
          type="search"
          maxLength={80}
          value={q}
          onChange={(event) => updateFilters({ q: event.target.value })}
          placeholder="Search meals or kitchens"
          className="h-12 w-full rounded-full border border-foodie-line bg-white/80 pr-12 pl-12 text-base outline-none focus:border-foodie-action focus:ring-3 focus:ring-foodie-action/10 sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => updateFilters({ q: "" })}
            aria-label="Clear search"
            className="absolute top-0 right-1 grid size-12 place-items-center text-foodie-muted"
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      <HomeHero onExplore={explore} />
      <div className="mt-4 flex items-center gap-3 sm:mt-5">
        <div className="min-w-0 flex-1">
          <CravingCategories
            selected={category}
            categories={categories.data || []}
            onSelect={(value) => updateFilters({ category: value })}
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
      <NearbyKitchens
        pages={discovery.data?.pages}
        loading={discovery.isPending}
        failed={discovery.isError || discovery.isFetchNextPageError}
        fetching={discovery.isFetching}
        hasMore={!!discovery.hasNextPage}
        categories={categories.data || []}
        filtered={!!(q || category || openOnly)}
        returnTo={`/home${params.size ? `?${params}` : ""}`}
        onRetry={() => discovery.refetch()}
        onMore={() => discovery.fetchNextPage()}
        onClear={() => updateFilters({ q: "", category: "", open: "" })}
      />
    </>
  );
}
