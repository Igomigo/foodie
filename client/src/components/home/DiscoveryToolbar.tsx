"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { FoodCategory } from "@/types/discovery";
import CravingCategories from "./CravingCategories";
import DiscoverySearch from "./DiscoverySearch";
import { CategoryPillsSkeleton } from "./DiscoverySkeletons";

export default function DiscoveryToolbar({
  categories,
  loading,
  category,
  onCategory,
  openOnly,
  onOpenOnly,
  query,
  onQuery,
  searchMode,
}: {
  categories: FoodCategory[];
  loading: boolean;
  category: string;
  onCategory: (value: string) => void;
  openOnly: boolean;
  onOpenOnly: (value: boolean) => void;
  query: string;
  onQuery: (value: string) => void;
  searchMode: boolean;
}) {
  const [expanded, setExpanded] = useState(!!query || searchMode);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (query.trim()) setExpanded(true);
  }, [query]);
  useEffect(() => {
    if (expanded && window.matchMedia("(min-width: 768px)").matches)
      input.current?.focus({ preventScroll: true });
  }, [expanded]);
  return (
    <div className="mt-4 sm:mt-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {loading ? (
            <CategoryPillsSkeleton />
          ) : (
            <CravingCategories
              selected={category}
              categories={categories}
              onSelect={onCategory}
            />
          )}
        </div>
        <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 border-l border-foodie-line pl-3 text-xs text-foodie-muted sm:pl-4">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(event) => onOpenOnly(event.target.checked)}
            className="size-4 accent-foodie-action"
          />
          Open now
        </label>
        <button
          ref={trigger}
          type="button"
          aria-expanded={expanded}
          aria-controls="desktop-discovery-search"
          onClick={() => setExpanded(!expanded)}
          className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full border border-foodie-line bg-white/70 px-4 text-xs text-foodie-forest transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-foodie-action md:inline-flex"
        >
          <Search size={16} aria-hidden="true" /> Search
          {query && (
            <span
              className="size-1.5 rounded-full bg-foodie-action"
              aria-label="Search filter active"
            />
          )}
        </button>
      </div>
      <div
        id="desktop-discovery-search"
        aria-hidden={!expanded}
        inert={!expanded}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setExpanded(false);
            trigger.current?.focus();
          }
        }}
        className={`hidden transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none md:grid ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-3 pb-1">
            <DiscoverySearch
              inputId="desktop-food-search"
              inputRef={input}
              value={query}
              onChange={onQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
