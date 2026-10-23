"use client";

import { useState } from "react";
import { useProfile } from "@/components/app/ProfileContext";
import BrandButton from "@/components/shared/BrandButton";
import {
  locationInputSchema,
  toSavedLocation,
  type LocationInput,
} from "@/lib/location-validation";
import { apiErrorMessage } from "@/lib/api-error";
import { updateLocation } from "@/sevices/user.service";
import LocationPicker from "./LocationPicker";
import CurrentLocationButton, {
  type DevicePosition,
} from "./CurrentLocationButton";

export default function LocationForm({ onSaved }: { onSaved?: () => void }) {
  const { user, updateProfile } = useProfile();
  const saved = user?.location;
  const [value, setValue] = useState<LocationInput>({
    country: "Nigeria",
    state: saved?.state ?? "",
    city: saved?.city ?? "",
    lga: saved?.lga ?? "",
    area: saved?.area ?? "",
  });
  const [position, setPosition] = useState<DevicePosition>({
    point: saved?.point,
    accuracyMeters: saved?.accuracyMeters,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LocationInput, string>>
  >({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedMessage, setDetectedMessage] = useState("");

  return (
    <form
      noValidate
      className="space-y-5"
      aria-busy={pending || detecting}
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending || detecting) return;
        const result = locationInputSchema.safeParse(value);
        setError("");
        if (!result.success) {
          const next: typeof errors = {};
          for (const issue of result.error.issues)
            next[issue.path[0] as keyof LocationInput] = issue.message;
          setErrors(next);
          const first = result.error.issues[0]?.path[0];
          if (typeof first === "string")
            document.getElementById(first)?.focus();
          return;
        }
        setErrors({});
        setPending(true);
        try {
          const profile = await updateLocation({
            ...toSavedLocation(result.data),
            ...position,
          });
          updateProfile(profile);
          onSaved?.();
        } catch (failure) {
          setError(
            apiErrorMessage(
              failure,
              "We couldn’t save your location. Please try again.",
            ),
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <fieldset disabled={pending || detecting} className="space-y-5">
        <legend className="sr-only">Your discovery location</legend>
        <LocationPicker
          value={value}
          errors={errors}
          onChange={(next) => {
            const changedKnownArea =
              value.state !== next.state ||
              (value.city && value.city !== next.city) ||
              (value.lga && value.lga !== next.lga) ||
              value.area !== next.area;
            setValue(next);
            setDetectedMessage("");
            if (changedKnownArea) setPosition({});
          }}
        />
        <div className="rounded-2xl bg-foodie-sage/25 p-4">
          <CurrentLocationButton
            onPendingChange={setDetecting}
            onLocated={(location, devicePosition) => {
              setValue(location);
              setPosition(devicePosition);
              setErrors({});
              setError("");
              const found = [
                location.city,
                location.state,
                location.lga ? `${location.lga} LGA` : "",
              ]
                .filter(Boolean)
                .join(", ");
              const missing = [
                !location.city && "city",
                !location.lga && "LGA",
              ].filter(Boolean);
              setDetectedMessage(
                missing.length
                  ? `Found ${found}. Choose your ${missing.join(" and ")}, then review and save.`
                  : `Found ${found}. Review the fields, then save.`,
              );
            }}
          />
          {detectedMessage && (
            <p
              role="status"
              className="mt-3 text-xs leading-relaxed text-foodie-forest"
            >
              {detectedMessage}
            </p>
          )}
          {position.point && (
            <div
              role="status"
              className="mt-3 flex items-center justify-between gap-3 text-[11px] text-foodie-forest"
            >
              <span>
                Device location ready
                {position.accuracyMeters !== undefined
                  ? ` · approx. ${Math.round(position.accuracyMeters)} m accuracy`
                  : ""}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPosition({});
                  setDetectedMessage("");
                }}
                className="min-h-9 underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
      <BrandButton
        type="submit"
        disabled={pending || detecting}
        className="w-full"
      >
        {pending ? "Saving your location…" : "Save my location"}
      </BrandButton>
    </form>
  );
}
