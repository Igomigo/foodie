import { userRepository } from "../../repositories/userRepository/userRepo";
import { publicUser } from "../../user/user.presenter";
import { httpError } from "../../utils/httpError";
import { generateAccessToken, verifyToken } from "../../utils/jwt";

export async function refreshAccessToken(token: string) {
  const userId = verifyToken(token, "refresh");
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) throw httpError(401, "Account is unavailable");

  const result = publicUser(user);
  return {
    accessToken: generateAccessToken({
      userId,
      role: result.role,
      roles: result.roles,
    }),
  };
}
