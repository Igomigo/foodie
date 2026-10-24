"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@/config/axios";
import { getProfile } from "@/sevices/user.service";
import { getSavedProfile, saveProfile } from "@/lib/profile-session";

export const profileKey = (userId: string | null) =>
  ["profile", userId] as const;

export function useProfile() {
  const userId = getUserId();
  return useQuery({
    queryKey: profileKey(userId),
    enabled: !!userId,
    queryFn: async ({ signal }) => {
      if (!userId) throw new Error("Please sign in to view your profile.");
      const profile = await getProfile(userId, signal);
      if (!signal.aborted) saveProfile(profile);
      return profile;
    },
    initialData: getSavedProfile,
    // The stored snapshot can be shown immediately, but must be checked on reload.
    initialDataUpdatedAt: 0,
  });
}
