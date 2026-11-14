import { axiosInstance } from "@/config/axios";
import type {
  FoodCategory,
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
): Promise<KitchenMenuResults> {
  const response = await axiosInstance.get(
    `/discovery/kitchens/${encodeURIComponent(id)}/menu`,
    { signal, params: { page, limit: 20 } },
  );
  return response.data.data;
}
