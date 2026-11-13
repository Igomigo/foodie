import { userRepository } from "../repositories/userRepository/userRepo";
import { publicUser } from "./user.presenter";
import { httpError } from "../utils/httpError";
import { Location } from "../domain/location.schema";
import {
  prepareConfirmedLocation,
  preserveAddressDetails,
} from "../location/saved-location";

export async function getUserById(id: string) {
  const user = await userRepository.findById(id);
  if (!user) throw httpError(404, "User not found");
  return publicUser(user);
}

export async function updateUserLocation(
  id: string,
  location: Location,
  confirmed = false,
) {
  let next: Location;
  if (confirmed) next = prepareConfirmedLocation(location);
  else {
    const existing = await userRepository.findById(id);
    if (!existing) throw httpError(404, "User not found");
    next = preserveAddressDetails(existing.location, location);
  }
  const user = await userRepository.updateLocation(id, next);
  if (!user) throw httpError(404, "User not found");
  return publicUser(user);
}
