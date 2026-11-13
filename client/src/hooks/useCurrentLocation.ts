"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { lookupDeviceLocation } from "@/sevices/location.service";
import type { SavedLocation } from "@/types/user";

export type DevicePosition = Pick<SavedLocation, "point" | "accuracyMeters">;

export function useCurrentLocation() {
  const [stage, setStage] = useState<"locating" | "looking-up">("locating");
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  const mutation = useMutation({
    // Never refetch or replay a device lookup, including after reconnecting.
    retry: false,
    networkMode: "always",
    gcTime: 0,
    mutationFn: async () => {
      if (!navigator.geolocation)
        throw new Error(
          "Your browser doesn’t support location. You can enter your address instead.",
        );
      const controller = new AbortController();
      request.current = controller;
      setStage("locating");
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (failure) => {
              reject(
                new Error(
                  failure.code === 1
                    ? "Location permission wasn’t granted. You can enter your address instead."
                    : "We couldn’t find your position. Try again or enter your address.",
                ),
              );
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
          );
        },
      );
      // The browser's permission prompt cannot be cancelled, but its result can be ignored.
      controller.signal.throwIfAborted();
      setStage("looking-up");
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const result = await lookupDeviceLocation(position, controller.signal);
        return {
          location: result.address,
          attribution: result.attribution,
          position: {
            point: {
              type: "Point",
              coordinates: [
                position.coords.longitude,
                position.coords.latitude,
              ],
            },
            accuracyMeters: position.coords.accuracy,
          } satisfies DevicePosition,
        };
      } catch (error) {
        if (controller.signal.aborted)
          throw new Error(
            "The address lookup took too long. Try again or enter your address.",
          );
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    },
  });

  function cancel() {
    request.current?.abort();
    mutation.reset();
  }
  return { ...mutation, stage, cancel };
}
