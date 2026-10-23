import { userRepository } from "../../repositories/userRepository/userRepo";
import { publicUser } from "../../user/user.presenter";
import { hashPassword } from "../../utils/bcrypt";
import { httpError } from "../../utils/httpError";
import { UserSignupInput } from "./userSignup.dto";

export async function signupUser(data: UserSignupInput) {
  if (await userRepository.findByEmailOrUsername(data.email, data.username)) {
    throw httpError(409, "User already exists");
  }

  const user = await userRepository.create({
    email: data.email,
    passwordHash: await hashPassword(data.password),
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    location: data.location,
    roles: ["user"],
  });
  return publicUser(user);
}
