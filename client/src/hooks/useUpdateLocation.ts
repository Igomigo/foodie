"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/config/axios";
import { saveProfile } from "@/lib/profile-session";
import { updateLocation } from "@/sevices/user.service";
import { profileKey } from "./useProfile";
import type { SavedLocation } from "@/types/user";

export function useUpdateLocation({
  confirmed = false,
}: { confirmed?: boolean } = {}) {
  const client = useQueryClient();
  const userId = getUserId();
  const queryKey = profileKey(userId);
  return useMutation({
    mutationFn: (location: SavedLocation) =>
      updateLocation(location, confirmed),
    // A previous profile fetch must not overwrite the newly saved location.
    onMutate: () => client.cancelQueries({ queryKey }),
    onSuccess: async (profile) => {
      if (getUserId() !== userId) return;
      saveProfile(profile);
      client.setQueryData(queryKey, profile);
      await client.invalidateQueries({ queryKey });
    },
  });
}
