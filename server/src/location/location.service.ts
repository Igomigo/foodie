import { httpError } from "../utils/httpError";
import {
  searchGeoapifyAddresses,
  reverseGeoapifyCoordinates,
} from "./geoapify";
import type { AddressSuggestion, Coordinates } from "./location.types";
import { fetchGeoapifyTile } from "./geoapify-map";

export { geoapifyAttribution as locationAttribution } from "./geoapify";

export function getMapTile(z: number, x: number, y: number) {
  if (
    !Number.isInteger(z) ||
    z < 0 ||
    z > 19 ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    y < 0 ||
    x >= 2 ** z ||
    y >= 2 ** z
  )
    throw httpError(400, "Invalid map tile");
  return fetchGeoapifyTile(z, x, y);
}

export function searchAddresses(text: string): Promise<AddressSuggestion[]> {
  if (
    typeof text !== "string" ||
    text.trim().length < 3 ||
    text.trim().length > 200
  )
    throw httpError(400, "Enter an address between 3 and 200 characters");

  return searchGeoapifyAddresses(text.trim());
}

export function reverseGeocode(
  coordinates: Coordinates,
): Promise<AddressSuggestion | null> {
  if (
    !coordinates ||
    !Number.isFinite(coordinates.latitude) ||
    !Number.isFinite(coordinates.longitude) ||
    Math.abs(coordinates.latitude) > 90 ||
    Math.abs(coordinates.longitude) > 180
  )
    throw httpError(400, "Enter valid latitude and longitude coordinates");

  return reverseGeoapifyCoordinates(coordinates);
}
