"use client";

import { LocateFixed } from "lucide-react";
import type { LocationInput } from "@/lib/location-validation";
import {
  useCurrentLocation,
  type DevicePosition,
} from "@/hooks/useCurrentLocation";
export type { DevicePosition } from "@/hooks/useCurrentLocation";

export default function CurrentLocationButton({
  onLocated,
  onPendingChange,
}: {
  onLocated: (location: LocationInput, position: DevicePosition) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const lookup = useCurrentLocation();
  const stage = lookup.isPending ? lookup.stage : "idle";

  function locate() {
    onPendingChange(true);
    lookup.mutate(undefined, {
      onSuccess: ({ location, position }) => onLocated(location, position),
      onSettled: () => onPendingChange(false),
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={stage !== "idle"}
        onClick={locate}
        className="flex min-h-11 items-center gap-2 text-xs font-semibold text-foodie-forest underline-offset-4 hover:underline disabled:opacity-50"
      >
        <LocateFixed size={16} aria-hidden="true" />
        {stage === "locating"
          ? "Finding your position…"
          : stage === "looking-up"
            ? "Finding your area…"
            : "Use my current location"}
      </button>
      <p className="text-[11px] leading-relaxed text-foodie-muted">
        With your permission,{" "}
        <a
          href="https://www.bigdatacloud.com/privacy-and-cookie-policy"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          BigDataCloud
        </a>{" "}
        receives your device’s coordinates and IP address to fill this form.
        Review before saving.
      </p>
      {lookup.error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {lookup.error.message}
        </p>
      )}
    </div>
  );
}
