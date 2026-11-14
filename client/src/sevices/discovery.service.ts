import { axiosInstance } from "@/config/axios";
import type {
  MenuItem,
  FoodCategory,
  MealResults,
  DiscoveryFeed,
  DiscoveryFilters,
  KitchenResults,
  KitchenMenuResults,
} from "@/types/discovery";

export async function getFoodCategories(
  signal: AbortSignal,
): Promise<FoodCategory[]> {
  const response = await axiosInstance.get("/food-categories", { signal });
  return response.data.data;
}
export async function getKitchens(
  filters: DiscoveryFilters,
  page: number,
  signal: AbortSignal,
): Promise<KitchenResults> {
  const response = await axiosInstance.get("/discovery/kitchens", {
    signal,
    params: {
      q: filters.q || undefined,
      category: filters.category || undefined,
      openOnly: filters.openOnly,
      page,
      limit: 12,
    },
  });
  return response.data.data;
}
export async function getKitchenMenu(
  id: string,
  page: number,
  signal: AbortSignal,
  section?: string,
): Promise<KitchenMenuResults> {
  const response = await axiosInstance.get(
    `/discovery/kitchens/${encodeURIComponent(id)}/menu`,
    { signal, params: { page, limit: 20, section: section || undefined } },
  );
  return response.data.data;
}

export async function getDiscoveryMeals(
  filters: DiscoveryFilters,
  page: number,
  signal: AbortSignal,
): Promise<MealResults> {
  const response = await axiosInstance.get("/discovery/meals", {
    signal,
    params: {
      ...filters,
      q: filters.q || undefined,
      category: filters.category || undefined,
      page,
      limit: 12,
    },
  });
  return response.data.data;
}
export async function getDiscoveryFeed(
  signal: AbortSignal,
): Promise<DiscoveryFeed> {
  const response = await axiosInstance.get("/discovery/feed", { signal });
  return response.data.data;
}

export async function getDiscoveryMeal(
  kitchenId: string,
  mealId: string,
  signal: AbortSignal,
): Promise<MenuItem> {
  const response = await axiosInstance.get(
    `/discovery/kitchens/${encodeURIComponent(kitchenId)}/meals/${encodeURIComponent(mealId)}`,
    { signal },
  );
  return response.data.data;
}
