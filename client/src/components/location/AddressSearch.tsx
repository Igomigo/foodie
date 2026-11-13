"use client";

import { useState } from "react";
import { ArrowUpRight, LoaderCircle, MapPin, Search, X } from "lucide-react";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { apiErrorMessage } from "@/lib/api-error";
import type { AddressSuggestion } from "@/types/location";

export default function AddressSearch({
  onSelect,
  onManual,
}: {
  onSelect: (address: AddressSuggestion) => void;
  onManual: () => void;
}) {
  const [text, setText] = useState("");
  const [active, setActive] = useState(-1);
  const [showResults, setShowResults] = useState(true);
  const search = useAddressSearch(text);
  const suggestions = search.data?.suggestions ?? [];
  const loading =
    text.trim().length >= 3 && (search.isDebouncing || search.isFetching);
  return (
    <div>
      <label
        htmlFor="address-search"
        className="mb-3 block text-xs font-medium"
      >
        Your address, street or landmark
      </label>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute top-[19px] left-4 text-foodie-muted"
          aria-hidden="true"
        />
        <input
          id="address-search"
          value={text}
          maxLength={200}
          autoComplete="off"
          autoFocus
          role="combobox"
          aria-autocomplete="list"
          aria-controls="address-results"
          aria-expanded={showResults && suggestions.length > 0}
          aria-activedescendant={
            active >= 0 && suggestions[active]
              ? `address-result-${active}`
              : undefined
          }
          placeholder="e.g. Marina, Lagos"
          onChange={(event) => {
            setText(event.target.value);
            setActive(-1);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((value) => Math.min(value + 1, suggestions.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => Math.max(value - 1, 0));
            }
            if (event.key === "Escape") {
              setActive(-1);
              setShowResults(false);
            }
            if (event.key === "Enter" && active >= 0 && suggestions[active]) {
              event.preventDefault();
              onSelect(suggestions[active]);
            }
          }}
          className="h-14 w-full rounded-2xl border border-foodie-line bg-foodie-paper/50 pr-12 pl-11 text-base outline-none transition-shadow placeholder:text-foodie-muted/60 focus:border-foodie-action focus:ring-4 focus:ring-foodie-action/8 sm:text-sm"
        />
        {text && (
          <button
            type="button"
            aria-label="Clear address search"
            onClick={() => {
              setText("");
              setActive(-1);
              document.getElementById("address-search")?.focus();
            }}
            className="absolute top-1 right-1 grid size-12 place-items-center rounded-xl text-foodie-muted hover:text-foodie-ink"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="mt-3 min-h-32" aria-busy={loading}>
        {loading && (
          <p
            role="status"
            className="flex items-center gap-2 px-1 py-5 text-xs text-foodie-muted"
          >
            <LoaderCircle size={15} className="motion-safe:animate-spin" />
            Looking for your address…
          </p>
        )}
        {search.isError && !loading && (
          <p role="alert" className="py-4 text-xs leading-relaxed text-red-700">
            {apiErrorMessage(
              search.error,
              "Address search is unavailable. You can enter your address manually.",
            )}
          </p>
        )}
        <ul
          id="address-results"
          role="listbox"
          aria-label="Address suggestions"
          className="max-h-72 overflow-y-auto rounded-2xl"
        >
          {!loading &&
            showResults &&
            suggestions.map((address, index) => (
              <li
                key={`${address.formattedAddress}-${index}`}
                role="option"
                id={`address-result-${index}`}
                aria-selected={index === active}
              >
                <button
                  type="button"
                  onClick={() => onSelect(address)}
                  className={`group flex min-h-19 w-full items-center gap-3 border-b border-foodie-line/65 px-3 py-4 text-left transition-colors last:border-0 hover:bg-foodie-sage/20 focus-visible:bg-foodie-sage/25 focus-visible:outline-foodie-action ${active === index ? "bg-foodie-sage/25" : ""}`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foodie-paper">
                    <MapPin size={16} strokeWidth={1.5} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-xs leading-relaxed">
                      {address.formattedAddress}
                    </span>
                    <span className="mt-1 block text-[10px] text-foodie-muted">
                      {address.precision === "area"
                        ? "Area match · choose your exact pin next"
                        : "Review the address and pin next"}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="shrink-0 text-foodie-muted"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
        </ul>
        {!loading &&
          search.isSuccess &&
          suggestions.length === 0 &&
          text.trim().length >= 3 && (
            <p
              role="status"
              className="py-4 text-xs leading-relaxed text-foodie-muted"
            >
              No match just yet. Try a nearby landmark or enter your address
              manually.
            </p>
          )}
        {text.trim().length < 3 && (
          <p className="px-1 py-4 text-xs leading-relaxed text-foodie-muted">
            Start with your street, a familiar landmark or the name of your
            area.
          </p>
        )}
      </div>
      {search.data?.attribution && (
        <p className="mt-2 text-[9px] text-foodie-muted">
          <a
            href={search.data.attribution.url}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {search.data.attribution.text}
          </a>
        </p>
      )}
      <button
        type="button"
        onClick={onManual}
        className="mt-6 flex min-h-11 items-center gap-3 text-xs font-medium text-foodie-action hover:underline"
      >
        Enter address details manually{" "}
        <ArrowUpRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
