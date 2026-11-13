import type { Location } from "../domain/location.schema";
import { httpError } from "../utils/httpError";
import {
  findNigerianCity,
  findNigerianState,
  findLocalGovernment,
} from "./location.catalogue";

export function prepareConfirmedLocation(location: Location): Location {
  const state = findNigerianState(location.state);
  if (
    !["nigeria", "ng"].includes(location.country.toLowerCase()) ||
    !state ||
    (location.stateCode && location.stateCode !== state.code)
  )
    throw httpError(400, "Choose a valid Nigerian state");

  const city = findNigerianCity(state.code, location.city);
  if (location.cityId !== undefined && location.cityId !== city?.id)
    throw httpError(400, "City code does not match the selected city");

  const lga = location.lga
    ? findLocalGovernment(state.code, location.lga)
    : undefined;
  if (
    (location.lga && !lga) ||
    (location.lgaCode && location.lgaCode !== lga?.id)
  )
    throw httpError(400, "Choose an LGA belonging to the selected state");

  const canonical: Location = {
    ...location,
    country: "Nigeria",
    countryCode: "NG",
    state: state.name,
    stateCode: state.code,
    city: city?.name ?? location.city,
    cityId: city?.id,
    lga: lga?.name,
    lgaCode: lga?.id,
    confirmedAt: new Date(),
  };
  canonical.formattedAddress = [
    canonical.street1,
    canonical.street2,
    canonical.area,
    canonical.city,
    canonical.state,
    canonical.zip,
    canonical.country,
  ]
    .filter(Boolean)
    .join(", ");
  return canonical;
}

// Older forms omit address details. Keep them only for the same saved destination.
export function preserveAddressDetails(
  previous: Location | undefined,
  next: Location,
): Location {
  if (
    !previous?.point ||
    !next.point ||
    previous.point.coordinates[0] !== next.point.coordinates[0] ||
    previous.point.coordinates[1] !== next.point.coordinates[1]
  )
    return next;

  const same = (left?: string, right?: string) =>
    (left ?? "").trim().toLowerCase() === (right ?? "").trim().toLowerCase();
  for (const field of ["country", "state", "city", "lga", "area"] as const)
    if (!same(previous[field], next[field])) return next;
  for (const field of ["street1", "street2", "zip"] as const)
    if (next[field] !== undefined && !same(previous[field], next[field]))
      return next;
  if (
    next.accuracyMeters !== undefined &&
    next.accuracyMeters !== previous.accuracyMeters
  )
    return next;

  return {
    street1: previous.street1,
    street2: previous.street2,
    zip: previous.zip,
    formattedAddress: previous.formattedAddress,
    pointSource: previous.pointSource,
    confirmedAt: previous.confirmedAt,
    accuracyMeters: previous.accuracyMeters,
    ...next,
  };
}
