import { axiosInstance } from "@/config/axios";
import type { UserProfile, SavedLocation } from "@/types/user";

export async function getProfile(
  id: string,
  signal?: AbortSignal,
): Promise<UserProfile> {
  const response = await axiosInstance.get(`/users/${id}`, { signal });
  return response.data.data;
}

export async function updateLocation(
  location: SavedLocation,
  confirmed = false,
): Promise<UserProfile> {
  const response = await axiosInstance.patch("/users/me/location", {
    location,
    ...(confirmed ? { confirmed: true } : {}),
  });
  return response.data.data;
}
