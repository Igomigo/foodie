import { axiosInstance } from "@/config/axios";
import type { UserProfile, SavedLocation } from "@/types/user";

export async function getProfile(id: string): Promise<UserProfile> {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data.data;
}

export async function updateLocation(
  location: SavedLocation,
): Promise<UserProfile> {
  const response = await axiosInstance.patch("/users/me/location", {
    location,
  });
  return response.data.data;
}
