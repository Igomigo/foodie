"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import BrandButton from "@/components/shared/BrandButton";
import {
  locationInputSchema,
  toSavedLocation,
  type LocationInput,
} from "@/lib/location-validation";
import { apiErrorMessage } from "@/lib/api-error";
import { useUpdateLocation } from "@/hooks/useUpdateLocation";
import LocationPicker from "./LocationPicker";
import type { DevicePosition } from "@/hooks/useCurrentLocation";

export default function LocationForm({ onSaved }: { onSaved?: () => void }) {
  const { data: user } = useProfile();
  const saveLocation = useUpdateLocation();
  const pending = saveLocation.isPending;
  const error = saveLocation.error
    ? apiErrorMessage(
        saveLocation.error,
        "We couldn’t save your location. Please try again.",
      )
    : "";
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

  return (
    <form
      noValidate
      className="space-y-5"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const result = locationInputSchema.safeParse(value);
        saveLocation.reset();
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
        saveLocation.mutate(
          {
            ...toSavedLocation(result.data),
            ...position,
          },
          { onSuccess: () => onSaved?.() },
        );
      }}
    >
      <fieldset disabled={pending} className="space-y-5">
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
            if (changedKnownArea) setPosition({});
          }}
        />
      </fieldset>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
      <BrandButton type="submit" disabled={pending} className="w-full">
        {pending ? "Saving your location…" : "Save my location"}
      </BrandButton>
    </form>
  );
}
