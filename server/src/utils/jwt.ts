import jwt from "jsonwebtoken";
import { isObjectIdOrHexString } from "mongoose";
import { Role } from "../domain/user.model";
import { httpError } from "./httpError";

interface TokenIdentity {
  userId: string;
  role: string;
  roles: Role[];
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) throw new Error("JWT_SECRET_KEY is not defined");
  return secret;
}

export function generateAccessToken(identity: TokenIdentity) {
  return jwt.sign({ ...identity, type: "access" }, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: "5m",
  });
}

export function generateRefreshToken(identity: TokenIdentity) {
  return jwt.sign({ ...identity, type: "refresh" }, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export function verifyToken(token: string, type: "access" | "refresh"): string {
  const secret = getJwtSecret();
  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    if (
      typeof payload === "string" ||
      payload.type !== type ||
      typeof payload.userId !== "string" ||
      !isObjectIdOrHexString(payload.userId)
    ) {
      throw new Error("Invalid token payload");
    }
    return payload.userId;
  } catch {
    throw httpError(401, "Token expired or invalid");
  }
}
