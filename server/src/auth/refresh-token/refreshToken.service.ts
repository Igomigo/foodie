import { userRepository } from "../../repositories/userRepository/userRepo";
import { publicUser } from "../../user/user.presenter";
import { httpError } from "../../utils/httpError";
import { generateAccessToken, verifyToken } from "../../utils/jwt";

export async function refreshAccessToken(token: string) {
  const { userId, tokenVersion } = verifyToken(token, "refresh");
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive || (user.tokenVersion ?? 0) !== tokenVersion)
    throw httpError(401, "Session expired. Please sign in again");

  const result = publicUser(user);
  return {
    accessToken: generateAccessToken({
      userId,
      role: result.role,
      roles: result.roles,
      tokenVersion: user.tokenVersion ?? 0,
    }),
  };
}
