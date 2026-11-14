"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getFoodCategories,
  getKitchens,
  getKitchenMenu,
} from "@/sevices/discovery.service";
import type { DiscoveryFilters } from "@/types/discovery";
import type { UserProfile } from "@/types/user";
import { useProfile } from "./useProfile";

// Every saved destination gets its own private cache. Never reuse another
// address's results while the new destination is loading.
export function discoveryKey(profile?: UserProfile) {
  const location = profile?.location;
  return [
    "discovery",
    profile?.userId,
    location
      ? [
          location.country,
          location.state,
          location.city,
          location.point?.coordinates,
          location.confirmedAt,
        ]
      : null,
  ] as const;
}
export function useFoodCategories() {
  return useQuery({
    queryKey: ["food-categories"],
    queryFn: ({ signal }) => getFoodCategories(signal),
    staleTime: 60 * 60_000,
  });
}
export function useDiscovery(filters: DiscoveryFilters) {
  const { data: profile } = useProfile();
  return useInfiniteQuery({
    queryKey: [...discoveryKey(profile), "kitchens", filters],
    enabled: !!profile,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => getKitchens(filters, pageParam, signal),
    getNextPageParam: (page) => (page.hasMore ? page.page + 1 : undefined),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
export function useKitchenMenu(id: string) {
  const { data: profile } = useProfile();
  return useInfiniteQuery({
    queryKey: [...discoveryKey(profile), "menu", id],
    enabled: !!profile,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => getKitchenMenu(id, pageParam, signal),
    getNextPageParam: (page) => (page.hasMore ? page.page + 1 : undefined),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
