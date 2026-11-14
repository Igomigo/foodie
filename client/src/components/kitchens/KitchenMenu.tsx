"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useKitchenMenu, useDiscoveryMeal } from "@/hooks/useDiscovery";
import FilterPill from "@/components/shared/FilterPill";
import MealCard from "@/components/shared/MealCard";
import type { MenuItem } from "@/types/discovery";
import MealDetails from "./MealDetails";
import KitchenHeader from "./KitchenHeader";

export default function KitchenMenu({ id }: { id: string }) {
  const params = useSearchParams();
  const mealId = params.get("meal") || "";
  const deepMeal = useDiscoveryMeal(id, mealId);
  const section = params.get("section") || "";
  const menu = useKitchenMenu(id, section);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  useEffect(() => {
    if (mealId && deepMeal.data) setSelected(deepMeal.data);
  }, [mealId, deepMeal.data]);
  function closeMeal() {
    setSelected(null);
    const next = new URLSearchParams(window.location.search);
    next.delete("meal");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${next.size ? `?${next}` : ""}`,
    );
  }
  const trigger = useRef<HTMLButtonElement | null>(null);
  const first = menu.data?.pages[0];
  const kitchen = first?.vendor;
  const items = menu.data?.pages.flatMap((page) => page.items) || [];
  const status = isAxiosError(menu.error)
    ? menu.error.response?.status
    : undefined;
  function selectSection(value: string) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set("section", value);
    else next.delete("section");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${next.size ? `?${next}` : ""}`,
    );
  }
  function selectMeal(item: MenuItem, button: HTMLButtonElement) {
    trigger.current = button;
    setSelected(item);
  }
  return (
    <>
      {menu.isPending ? (
        <div
          role="status"
          aria-label="Loading kitchen menu"
          className="space-y-6 motion-safe:animate-pulse"
        >
          <div className="h-48 bg-foodie-line/50 sm:h-64 sm:rounded-3xl" />
          <div className="mx-auto size-20 rounded-full bg-foodie-line/50" />
          <div className="mx-auto h-8 w-1/2 rounded bg-foodie-line/50" />
        </div>
      ) : !kitchen ? (
        <div
          role="alert"
          className="mx-6 rounded-3xl border border-foodie-line p-8 sm:mx-0"
        >
          <h1 className="text-2xl font-medium tracking-tight">
            {status === 404
              ? "This kitchen or section isn’t available."
              : status === 409
                ? "Add your delivery address."
                : "We couldn’t load this menu."}
          </h1>
          <p className="mt-3 text-sm text-foodie-muted">
            Check your address or try again in a moment.
          </p>
          <div className="mt-4 flex flex-wrap gap-5">
            <Link
              href="/home"
              className="inline-flex min-h-11 items-center text-sm text-foodie-action underline"
            >
              Discover kitchens
            </Link>
            {section && (
              <button
                onClick={() => selectSection("")}
                className="min-h-11 text-sm text-foodie-action underline"
              >
                Show all
              </button>
            )}
            <button
              onClick={() => menu.refetch()}
              className="min-h-11 text-sm text-foodie-action underline"
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <>
          <KitchenHeader kitchen={kitchen} />
          <div className="px-6 sm:px-0">
            {first.mode === "city" && (
              <p className="mt-4 rounded-2xl bg-foodie-sage/30 p-4 text-xs text-foodie-muted">
                Browsing a city menu.{" "}
                <Link href="/settings" className="text-foodie-action underline">
                  Confirm your address
                </Link>{" "}
                to check delivery coverage.
              </p>
            )}
            {!kitchen.isAcceptingOrders && (
              <p className="mt-4 text-center text-xs text-foodie-muted">
                {kitchen.isOpen
                  ? "Orders are paused. You can still browse."
                  : "Closed right now. You can still browse the menu."}
              </p>
            )}
          </div>
          <nav
            id="kitchen-menu"
            tabIndex={-1}
            aria-label="Kitchen menu sections"
            className="scrollbar-hide sticky top-0 z-20 mx-4 mt-4 flex gap-2 overflow-x-auto rounded-[24px] bg-foodie-paper/95 p-2 backdrop-blur-xl sm:mx-0 md:top-[81px]"
          >
            {[{ id: "", name: "All", count: 0 }, ...(first.sections ?? [])].map(
              (entry) => (
                <FilterPill
                  key={entry.id}
                  type="button"
                  active={section === entry.id}
                  onClick={() => selectSection(entry.id)}
                >
                  {entry.name}
                </FilterPill>
              ),
            )}
          </nav>
          <div className="px-6 pt-6 sm:px-0">
            {deepMeal.isError && mealId && (
              <p role="alert" className="mb-4 text-sm text-foodie-muted">
                This dish isn’t available.{" "}
                <button
                  onClick={closeMeal}
                  className="min-h-11 text-foodie-action underline"
                >
                  Browse the menu
                </button>
              </p>
            )}
            {menu.isPlaceholderData && (
              <p role="status" className="mb-6 text-sm text-foodie-muted">
                Loading this section…
              </p>
            )}
            {!menu.isPlaceholderData &&
              (first.sections ?? [])
                .filter((entry) => !section || entry.id === section)
                .map((entry) => {
                  const group = items.filter((item) =>
                    entry.id === "other"
                      ? !first.sections.some(
                          (known) => known.id === item.sectionId,
                        )
                      : item.sectionId === entry.id,
                  );
                  return group.length ? (
                    <section
                      key={entry.id}
                      aria-label={entry.name}
                      className="mb-8"
                    >
                      <h2 className="mb-4 text-xl font-medium tracking-tight sm:text-2xl">
                        {entry.name}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {group.map((item) => (
                          <MealCard
                            key={item.menuItemId}
                            item={item}
                            onSelect={selectMeal}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null;
                })}
            {!items.length && (
              <p className="rounded-2xl border border-foodie-line p-6 text-sm text-foodie-muted">
                No published dishes are available right now.
              </p>
            )}
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
              <div className="text-center">
                <button
                  onClick={() => menu.fetchNextPage()}
                  disabled={menu.isFetching}
                  className="min-h-11 rounded-full border border-foodie-line px-6 text-xs font-medium disabled:opacity-50"
                >
                  {menu.isFetching ? "Loading dishes…" : "More dishes"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
      <MealDetails
        item={kitchen ? selected : null}
        onClose={closeMeal}
        onRestoreFocus={() =>
          (trigger.current || document.getElementById("kitchen-menu"))?.focus({
            preventScroll: true,
          })
        }
      />
    </>
  );
}
