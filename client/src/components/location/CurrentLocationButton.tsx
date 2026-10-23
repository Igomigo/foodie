"use client";

import { useRef, useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";
import type { SavedLocation } from "@/types/user";
import type { LocationInput } from "@/lib/location-validation";
import { lookupDeviceLocation } from "@/sevices/location.service";

export type DevicePosition = Pick<SavedLocation, "point" | "accuracyMeters">;

export default function CurrentLocationButton({
  onLocated,
  onPendingChange,
}: {
  onLocated: (location: LocationInput, position: DevicePosition) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [stage, setStage] = useState<"idle" | "locating" | "looking-up">(
    "idle",
  );
  const [error, setError] = useState("");
  const active = useRef(true);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      request.current?.abort();
    };
  }, []);

  function finish() {
    setStage("idle");
    onPendingChange(false);
  }

  function locate() {
    setError("");
    if (!navigator.geolocation) {
      setError(
        "Your browser doesn’t support location. You can enter your area above.",
      );
      return;
    }
    setStage("locating");
    onPendingChange(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!active.current) return;
        setStage("looking-up");
        const controller = new AbortController();
        request.current = controller;
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
          const location = await lookupDeviceLocation(
            position,
            controller.signal,
          );
          if (!active.current) return;
          onLocated(location, {
            point: {
              type: "Point",
              coordinates: [
                position.coords.longitude,
                position.coords.latitude,
              ],
            },
            accuracyMeters: position.coords.accuracy,
          });
        } catch (failure) {
          if (active.current)
            setError(
              controller.signal.aborted
                ? "The area lookup took too long. Try again or choose your area manually."
                : failure instanceof Error
                  ? failure.message
                  : "We couldn’t fill your area. Please choose it manually.",
            );
        } finally {
          clearTimeout(timeout);
          if (active.current) finish();
        }
      },
      (failure) => {
        if (!active.current) return;
        finish();
        setError(
          failure.code === 1
            ? "Location permission wasn’t granted. You can still enter your area above."
            : "We couldn’t find your position. Try again or enter your area above.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
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
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
