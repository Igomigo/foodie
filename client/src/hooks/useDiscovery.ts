"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getFoodCategories,
  getDiscoveryMeal,
  getDiscoveryMeals,
  getDiscoveryFeed,
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
export function useKitchenMenu(id: string, section = "") {
  const { data: profile } = useProfile();
  const queryKey = [...discoveryKey(profile), "menu", id, section] as const;
  return useInfiniteQuery({
    queryKey,
    // Keep branding steady when switching sections, but never across destinations or kitchens.
    enabled: !!profile,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      getKitchenMenu(id, pageParam, signal, section),
    getNextPageParam: (page) => (page.hasMore ? page.page + 1 : undefined),
    placeholderData: (previous, previousQuery) =>
      JSON.stringify(previousQuery?.queryKey.slice(0, -1)) ===
      JSON.stringify(queryKey.slice(0, -1))
        ? previous
        : undefined,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDiscoveryFeed(enabled = true) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: [...discoveryKey(profile), "feed"],
    enabled: !!profile && enabled,
    queryFn: ({ signal }) => getDiscoveryFeed(signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
export function useDiscoveryMeals(filters: DiscoveryFilters, enabled = true) {
  const { data: profile } = useProfile();
  return useInfiniteQuery({
    queryKey: [...discoveryKey(profile), "meals", filters],
    enabled: !!profile && enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      getDiscoveryMeals(filters, pageParam, signal),
    getNextPageParam: (page) => (page.hasMore ? page.page + 1 : undefined),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDiscoveryMeal(kitchenId: string, mealId: string) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: [...discoveryKey(profile), "meal", kitchenId, mealId],
    enabled: !!profile && !!mealId,
    queryFn: ({ signal }) => getDiscoveryMeal(kitchenId, mealId, signal),
    staleTime: 30_000,
  });
}
