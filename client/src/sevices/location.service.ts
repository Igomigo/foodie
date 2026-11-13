import { axiosInstance } from "@/config/axios";
import type { AddressSuggestion, LocationAttribution } from "@/types/location";

export async function getMapTile(
  z: number,
  x: number,
  y: number,
  signal: AbortSignal,
): Promise<Blob> {
  const response = await axiosInstance.get(`/locations/tiles/${z}/${x}/${y}`, {
    responseType: "blob",
    signal,
  });
  return response.data;
}

export async function searchAddresses(text: string, signal: AbortSignal) {
  const response = await axiosInstance.post<{
    data: {
      suggestions: AddressSuggestion[];
      attribution: LocationAttribution;
    };
  }>("/locations/search", { text }, { signal });
  return response.data.data;
}

export async function reverseGeocode(
  coordinates: { latitude: number; longitude: number },
  signal?: AbortSignal,
) {
  const response = await axiosInstance.post<{
    data: {
      address: AddressSuggestion | null;
      attribution: LocationAttribution;
    };
  }>("/locations/reverse", coordinates, { signal });
  return response.data.data;
}

export async function lookupDeviceLocation(
  position: GeolocationPosition,
  signal: AbortSignal,
) {
  const { latitude, longitude, accuracy } = position.coords;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > 5000
  )
    throw new Error(
      "Your device’s location is too approximate. Try again on your phone, or enter your address.",
    );
  return reverseGeocode({ latitude, longitude }, signal);
}
