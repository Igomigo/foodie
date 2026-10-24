"use client";

import { useState } from "react";
import LocationDialog from "@/components/location/LocationDialog";
import Link from "next/link";
import {
  ArrowUpRight,
  LogOut,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useLogout } from "@/hooks/useLogout";
import { apiErrorMessage } from "@/lib/api-error";

export default function SettingsPage() {
  const { data: user } = useProfile();
  const [locationOpen, setLocationOpen] = useState(false);
  const logout = useLogout();
  const pending = logout.isPending;
  const error = logout.error
    ? apiErrorMessage(
        logout.error,
        "We couldn’t sign you out. Please try again.",
      )
    : "";
  const location = user?.location;
  return (
    <div className="mx-auto max-w-[900px]">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-foodie-action uppercase">
        Your Foodie
      </p>
      <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
        A little more you.
      </h1>
      <p className="mt-4 text-sm text-foodie-muted">
        Your details, your neighbourhood, your next good meal.
      </p>
      <div className="mt-9 grid gap-5 md:grid-cols-[1.15fr_1fr]">
        <section className="rounded-3xl border border-foodie-line bg-white/60 p-6 sm:p-8">
          <UserRound
            size={23}
            strokeWidth={1.5}
            className="text-foodie-action"
            aria-hidden="true"
          />
          <h2 className="mt-5 text-xl font-medium tracking-tight">
            The person at the table
          </h2>
          <dl className="mt-7 space-y-5 text-sm">
            {[
              ["Name", user?.username || user?.firstName || "Foodie"],
              ["Email", user?.email],
              ["Phone", user?.phoneNumber || "Not added"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="mb-1 text-[11px] text-foodie-muted">{label}</dt>
                <dd className="break-words">{value || "Loading…"}</dd>
              </div>
            ))}
          </dl>
        </section>
        <div className="space-y-5">
          <section className="rounded-3xl bg-foodie-forest p-6 text-foodie-paper sm:p-8">
            <MapPin
              size={23}
              strokeWidth={1.5}
              className="text-foodie-sage"
              aria-hidden="true"
            />
            <h2 className="mt-5 text-xl font-medium tracking-tight">
              Keep it close to home.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foodie-paper/70">
              {location
                ? [location.area, location.lga, location.city, location.state]
                    .filter(Boolean)
                    .join(", ")
                : "Add your discovery location."}
            </p>
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="mt-5 flex min-h-11 items-center gap-4 text-xs font-semibold text-foodie-sage hover:underline"
            >
              Update my location <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          </section>
          <Link
            href="/auth/forgot-password"
            className="flex min-h-24 items-center gap-4 rounded-3xl border border-foodie-line bg-white/60 p-6 transition-colors hover:bg-foodie-sage/25"
          >
            <ShieldCheck size={22} strokeWidth={1.5} aria-hidden="true" />
            <span className="flex-1 text-sm">Reset my password</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <section className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t border-foodie-line py-7">
        <div>
          <h2 className="text-sm font-medium">Taking a little break?</h2>
          <p className="mt-1.5 text-xs text-foodie-muted">
            Your favourites can wait. Your appetite probably won’t.
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => window.location.replace("/auth/login"),
            })
          }
          className="flex min-h-12 items-center gap-3 rounded-full border border-foodie-line px-5 text-xs font-semibold text-foodie-action transition-colors hover:bg-foodie-action/5 disabled:opacity-50"
        >
          <LogOut size={17} aria-hidden="true" />
          {pending ? "Signing out…" : "Sign out"}
        </button>
        {error && (
          <p role="alert" className="w-full text-xs text-red-700">
            {error}
          </p>
        )}
      </section>
      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
    </div>
  );
}
