"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { reverseGeocode } from "@/sevices/location.service";
import type { SavedLocation } from "@/types/user";

export function usePinAddress() {
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const mutation = useMutation({
    retry: false,
    networkMode: "always",
    gcTime: 0,
    mutationFn: async (point: NonNullable<SavedLocation["point"]>) => {
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const result = await reverseGeocode(
          {
            latitude: point.coordinates[1],
            longitude: point.coordinates[0],
          },
          controller.signal,
        );
        // A late response must never replace the address of a newer pin.
        controller.signal.throwIfAborted();
        return result.address;
      } finally {
        clearTimeout(timeout);
      }
    },
  });
  function cancel() {
    request.current?.abort();
    mutation.reset();
  }
  return { ...mutation, cancel };
}
