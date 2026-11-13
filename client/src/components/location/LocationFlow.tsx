"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import Brand from "@/components/Brand";
import { useProfile } from "@/hooks/useProfile";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useUpdateLocation } from "@/hooks/useUpdateLocation";
import {
  addressFromSaved,
  addressFromSuggestion,
  confirmedAddress,
  emptyAddress,
  type AddressDetails,
} from "@/lib/address";
import { apiErrorMessage } from "@/lib/api-error";
import type { AddressDraft, AddressSuggestion } from "@/types/location";
import withAuth from "@/middleware/withAuth";
import AddressSearch from "./AddressSearch";
import AddressMap from "./AddressMap";
import AddressReview from "./AddressReview";
import LocationArtwork from "./LocationArtwork";
import LocationForm from "./LocationForm";

function LocationFlow({ returnTo }: { returnTo: "/home" | "/settings" }) {
  const router = useRouter();
  const { data: user } = useProfile();
  const current = useCurrentLocation();
  const save = useUpdateLocation({ confirmed: true });
  const [stage, setStage] = useState<"choose" | "search" | "review" | "area">(
    "choose",
  );
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress);
  const [revision, setRevision] = useState(0);
  const [pinEditing, setPinEditing] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const saved = user?.location;

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, [stage]);

  function review(address: AddressSuggestion | null, selected?: AddressDraft) {
    const next = selected ?? addressFromSuggestion(address);
    setDraft(next);
    setRevision((value) => value + 1);
    setCoarse(address?.precision === "area");
    setPinEditing(!next.point || address?.precision === "area");
    setFormError("");
    save.reset();
    setNotice(
      address?.precision === "area"
        ? "We found your area. Zoom in and set the pin on your street."
        : address && (address.distanceMeters ?? 0) > 100
          ? "The mapped address is nearby. Check the house number and street before you confirm."
          : !address && !selected
            ? "Enter your address details and choose a pin on the map."
            : "",
    );
    setStage("review");
  }

  function finish() {
    toast.success("Your address is saved");
    router.replace(returnTo);
  }

  function submit(details: AddressDetails) {
    setFormError("");
    try {
      save.mutate(confirmedAddress(details, draft), { onSuccess: finish });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Review your address before saving.",
      );
    }
  }

  return (
    <div className="min-h-svh bg-foodie-paper text-foodie-ink selection:bg-foodie-sage">
      <header className="mx-auto flex max-w-[1320px] items-center justify-between gap-5 px-6 py-6 sm:px-10 sm:py-8">
        <Brand href="/home" />
        <Link
          href={returnTo}
          className="flex min-h-11 items-center gap-2 text-[11px] text-foodie-muted hover:text-foodie-action"
        >
          {returnTo === "/settings" ? "Back to settings" : "Back to Foodie"}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </header>
      <main className="mx-auto max-w-[1216px] px-4 pb-10 sm:px-8 lg:pt-4">
        <div className="grid overflow-hidden rounded-[28px] border border-foodie-line/80 bg-white/70 shadow-[0_18px_70px_-40px_#263c3130] lg:grid-cols-[.95fr_1.05fr] lg:grid-rows-[auto_1fr] lg:rounded-[32px]">
          <div
            className={`order-2 lg:order-1 lg:row-span-2 ${stage === "review" ? "" : "hidden lg:block"}`}
          >
            {stage === "review" ? (
              <AddressMap
                key={`map-${revision}`}
                point={draft.point}
                needsAdjustment={coarse}
                disabled={save.isPending}
                onEditingChange={setPinEditing}
                onSelect={(point) => {
                  setDraft((previous) => ({
                    ...previous,
                    point,
                    pointSource: "pin",
                    accuracyMeters: undefined,
                  }));
                  setCoarse(false);
                  setNotice(
                    "Pin updated. Check that the address below matches your selected spot.",
                  );
                }}
              />
            ) : (
              <LocationArtwork />
            )}
          </div>
          <div className="order-1 px-6 pt-8 pb-7 sm:px-10 sm:pt-11 lg:order-2 xl:px-12">
            {stage !== "choose" ? (
              <button
                type="button"
                disabled={save.isPending}
                onClick={() => {
                  setStage("choose");
                  current.reset();
                  save.reset();
                  setFormError("");
                }}
                className="mb-6 flex min-h-8 items-center gap-2 text-[11px] text-foodie-muted hover:text-foodie-action"
              >
                <ArrowLeft size={14} />
                Back to location options
              </button>
            ) : (
              <p className="mb-7 flex items-center gap-2 text-[9px] font-semibold tracking-[.18em] text-foodie-action uppercase">
                <span className="size-1.5 rounded-full bg-foodie-action" />
                Your corner of the map
              </p>
            )}
            <h1
              ref={title}
              tabIndex={-1}
              className={`${stage === "review" ? "text-[clamp(1.8rem,4vw,2.3rem)]" : "text-[clamp(2.15rem,5vw,3.2rem)]"} leading-[1.06] font-medium tracking-[-.055em] outline-none`}
            >
              {stage === "review" ? (
                "Review your address."
              ) : stage === "search" ? (
                <>
                  Where should we
                  <br />
                  <em className="font-foodie-display font-normal text-foodie-action">
                    find you?
                  </em>
                </>
              ) : stage === "area" ? (
                <>
                  Your part
                  <br />
                  <em className="font-foodie-display font-normal text-foodie-action">
                    of town.
                  </em>
                </>
              ) : (
                <>
                  Good food.
                  <br />
                  <em className="font-foodie-display font-normal text-foodie-action">
                    Closer to you.
                  </em>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-85 text-xs leading-[1.85] text-foodie-muted">
              {stage === "review"
                ? "Check your pin and add any missing address details."
                : stage === "area"
                  ? "Save a discovery area now. You can add an exact address whenever you’re ready."
                  : "Where should we look for your next good meal?"}
            </p>
          </div>
          <div
            className={`order-3 min-w-0 px-6 pb-8 sm:px-10 sm:pb-10 xl:px-12 ${stage === "review" ? "pt-6 lg:pt-0" : ""}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -4 }}
                transition={{ duration: reduced ? 0 : 0.18 }}
              >
                {stage === "choose" && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={current.isPending}
                      onClick={() =>
                        current.mutate(undefined, {
                          onSuccess: (result) =>
                            review(result.location, {
                              ...addressFromSuggestion(result.location),
                              ...result.position,
                              pointSource: "device",
                            }),
                        })
                      }
                      className="group flex min-h-23 w-full items-center gap-4 rounded-2xl bg-foodie-forest px-5 py-5 text-left text-foodie-paper shadow-[0_6px_18px_#263c3110] transition-[background-color,transform] duration-200 hover:bg-[#1c3025] motion-safe:active:scale-[.99] disabled:opacity-70"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-foodie-sage/20 bg-foodie-sage/10">
                        {current.isPending ? (
                          <LoaderCircle
                            size={21}
                            strokeWidth={1.5}
                            className="motion-safe:animate-spin"
                          />
                        ) : (
                          <LocateFixed size={21} strokeWidth={1.5} />
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium">
                          {current.isPending
                            ? current.stage === "locating"
                              ? "Finding your position…"
                              : "Looking up your address…"
                            : "Use my current location"}
                        </span>
                        <span className="mt-1.5 block text-[10px] leading-relaxed text-foodie-paper/65">
                          {current.isPending
                            ? "Just a moment. We’re finding your place."
                            : "A little quicker. You’ll review it before saving."}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-foodie-sage"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        current.cancel();
                        setStage("search");
                      }}
                      className="group flex min-h-23 w-full items-center gap-4 rounded-2xl border border-foodie-line bg-white/60 px-5 py-5 text-left transition-colors hover:bg-foodie-sage/15 disabled:opacity-50"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-foodie-paper">
                        <Search size={20} strokeWidth={1.5} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium">
                          Enter an address
                        </span>
                        <span className="mt-1.5 block text-[10px] leading-relaxed text-foodie-muted">
                          Home, work or somewhere you’re heading.
                        </span>
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-foodie-muted"
                        aria-hidden="true"
                      />
                    </button>
                    {current.isPending && (
                      <p
                        role="status"
                        className="px-1 py-2 text-[11px] text-foodie-muted"
                      >
                        Your browser may ask you to allow location access.
                      </p>
                    )}
                    {current.isError && (
                      <p
                        role="alert"
                        className="rounded-xl bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700"
                      >
                        {apiErrorMessage(
                          current.error,
                          "We couldn’t find your address. Try entering it instead.",
                        )}
                      </p>
                    )}
                    {saved?.point && saved.street1 && (
                      <button
                        type="button"
                        disabled={current.isPending}
                        onClick={() => review(null, addressFromSaved(saved))}
                        className="mt-4 flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-foodie-paper"
                      >
                        <MapPin
                          size={17}
                          className="shrink-0 text-foodie-action"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[9px] tracking-[.12em] text-foodie-muted uppercase">
                            Your saved address
                          </span>
                          <span className="mt-1 block truncate text-xs">
                            {saved.street1}, {saved.city}
                          </span>
                        </span>
                        <ArrowUpRight size={15} />
                      </button>
                    )}
                    <p className="pt-6 text-[10px] leading-relaxed text-foodie-muted">
                      We’ll only request your device location when you ask. You
                      can change your address any time in Settings.
                    </p>
                  </div>
                )}
                {stage === "search" && (
                  <>
                    <AddressSearch
                      onSelect={(address) => review(address)}
                      onManual={() => review(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setStage("area")}
                      className="mt-2 min-h-10 text-[11px] text-foodie-muted hover:underline"
                    >
                      Choose just my area for now
                    </button>
                  </>
                )}
                {stage === "review" && (
                  <>
                    {notice && (
                      <p
                        role="status"
                        className="mb-5 rounded-xl border border-foodie-sage bg-foodie-sage/20 px-4 py-3 text-[11px] leading-relaxed text-foodie-forest"
                      >
                        {notice}
                      </p>
                    )}
                    <AddressReview
                      key={`review-${revision}`}
                      draft={draft}
                      pinEditing={pinEditing}
                      pending={save.isPending}
                      error={
                        formError ||
                        (save.error
                          ? apiErrorMessage(
                              save.error,
                              "Your address couldn’t be saved. Please try again.",
                            )
                          : "")
                      }
                      onSubmit={submit}
                      onRegionChange={() => {
                        setCoarse(true);
                        setPinEditing(true);
                        setNotice(
                          "Your city or state changed. Review the map pin for this address.",
                        );
                      }}
                      onDifferentAddress={() => {
                        save.reset();
                        setStage("search");
                      }}
                    />
                    <p className="mt-4 text-center text-[9px] text-foodie-muted">
                      Address lookup by{" "}
                      <a
                        href="https://www.geoapify.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2"
                      >
                        Geoapify
                      </a>{" "}
                      · © OpenStreetMap contributors
                    </p>
                  </>
                )}
                {stage === "area" && <LocationForm onSaved={finish} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 px-2 pt-6 text-[10px] text-foodie-muted">
          <span>Rooted in Nigeria. Made for your appetite.</span>
          <span>© {new Date().getFullYear()} Foodie.</span>
        </footer>
      </main>
    </div>
  );
}

export default withAuth(LocationFlow);
