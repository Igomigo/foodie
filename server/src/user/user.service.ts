import { userRepository } from "../repositories/userRepository/userRepo";
import { publicUser } from "./user.presenter";
import { httpError } from "../utils/httpError";
import { Location } from "../domain/location.schema";

export async function getUserById(id: string) {
  const user = await userRepository.findById(id);
  if (!user) throw httpError(404, "User not found");
  return publicUser(user);
}

export async function updateUserLocation(id: string, location: Location) {
  const user = await userRepository.updateLocation(id, location);
  if (!user) throw httpError(404, "User not found");
  return publicUser(user);
}
