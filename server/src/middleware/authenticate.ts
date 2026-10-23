import { RequestHandler } from "express";
import { userRepository } from "../repositories/userRepository/userRepo";
import { publicUser } from "../user/user.presenter";
import { httpError } from "../utils/httpError";
import { verifyToken } from "../utils/jwt";

export const authenticate: RequestHandler = async (req, res, next) => {
  const match = req.headers.authorization?.match(/^Bearer ([^\s]+)$/i);
  if (!match) throw httpError(401, "Authentication required");

  const { userId, tokenVersion } = verifyToken(match[1], "access");
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive || (user.tokenVersion ?? 0) !== tokenVersion)
    throw httpError(401, "Session expired. Please sign in again");

  // Read current roles from the database so role changes take effect immediately.
  res.locals.user = publicUser(user);
  next();
};
