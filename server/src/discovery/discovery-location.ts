import { Location } from "../domain/location.schema";
import {
  findNigerianState,
  findNigerianCity,
} from "../location/location.catalogue";

export interface DiscoveryDestination {
  mode: "nearby" | "city" | "location-required";
  point?: NonNullable<Location["point"]>;
  stateCode?: string;
  state?: string;
  cityId?: number;
  city?: string;
}

export function discoveryDestination(
  location?: Location,
): DiscoveryDestination {
  if (
    !location ||
    !["ng", "nigeria"].includes(location.country?.trim().toLowerCase())
  )
    return { mode: "location-required" };
  const state = findNigerianState(location.state);
  if (!state || !location.city?.trim()) return { mode: "location-required" };
  const city = findNigerianCity(state.code, location.city);
  const labels = {
    state: state.name,
    stateCode: state.code,
    city: city?.name ?? location.city,
    cityId: city?.id,
  };
  const point = location.point;
  if (
    location.confirmedAt &&
    point?.type === "Point" &&
    point.coordinates.length === 2 &&
    point.coordinates.every(Number.isFinite) &&
    Math.abs(point.coordinates[0]) <= 180 &&
    Math.abs(point.coordinates[1]) <= 90
  )
    return { mode: "nearby", point, ...labels };
  return { mode: "city", ...labels };
}
