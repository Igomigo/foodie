"use client";

import { Search, X } from "lucide-react";
import type { Ref } from "react";

export default function DiscoverySearch({
  value,
  onChange,
  inputId = "food-search",
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <div className="relative mx-auto max-w-2xl">
      <label htmlFor={inputId} className="sr-only">
        Search meals or kitchens
      </label>
      <Search
        size={19}
        aria-hidden="true"
        className="absolute top-4 left-4 text-foodie-muted"
      />
      <input
        id={inputId}
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        maxLength={80}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search meals or kitchens"
        className="h-12 w-full rounded-full border border-foodie-line bg-white/80 pr-12 pl-12 text-base outline-none focus:border-foodie-action focus:ring-3 focus:ring-foodie-action/10 sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-0 right-1 grid size-12 place-items-center text-foodie-muted"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
