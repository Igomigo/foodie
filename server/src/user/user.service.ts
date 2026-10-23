import { userRepository } from "../repositories/userRepository/userRepo";
import { publicUser } from "./user.presenter";
import { httpError } from "../utils/httpError";

export async function getUserById(id: string) {
  const user = await userRepository.findById(id);
  if (!user) throw httpError(404, "User not found");
  return publicUser(user);
}
