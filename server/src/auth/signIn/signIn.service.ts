import { userRepository } from "../../repositories/userRepository/userRepo";
import { publicUser } from "../../user/user.presenter";
import { comparePassword } from "../../utils/bcrypt";
import { httpError } from "../../utils/httpError";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { LoginInput } from "./signIn.dto";

export async function login(data: LoginInput) {
  const user = await userRepository.findForLogin(data.email);
  if (
    !user ||
    !user.isActive ||
    !(await comparePassword(data.password, user.passwordHash))
  ) {
    throw httpError(401, "Invalid email or password");
  }

  const result = publicUser(user);
  const identity = {
    userId: result.userId,
    role: result.role,
    roles: result.roles,
    tokenVersion: user.tokenVersion ?? 0,
  };
  return {
    ...result,
    accessToken: generateAccessToken(identity),
    refreshToken: generateRefreshToken(identity),
  };
}
