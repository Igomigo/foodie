import { createHash, randomBytes } from "node:crypto";
import { userRepository } from "../../repositories/userRepository/userRepo";
import {
  createMailTransport,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../../utils/mail";
import { hashPassword } from "../../utils/bcrypt";
import { httpError } from "../../utils/httpError";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function resetUrl(token: string) {
  const url = new URL("/auth/reset-password", process.env.CLIENT_URL);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:")
    throw new Error("CLIENT_URL must use HTTPS in production");
  // Fragments stay out of server access logs and referrer headers.
  url.hash = token;
  return url.toString();
}

export async function deliverPasswordReset(email: string) {
  const token = randomBytes(32).toString("hex");
  const hash = tokenHash(token);
  const user = await userRepository.reservePasswordReset(
    email,
    hash,
    new Date(Date.now() + 20 * 60_000),
  );
  if (!user) return;
  try {
    await sendPasswordResetEmail(user.email, resetUrl(token));
  } catch (error) {
    await userRepository.cancelPasswordReset(hash);
    throw error;
  }
}

export function requestPasswordReset(email: string) {
  createMailTransport();
  resetUrl("configuration-check");
  // Respond consistently; account lookup and SMTP delivery run after acceptance.
  setImmediate(() => {
    deliverPasswordReset(email).catch(() =>
      console.error("[Password reset] Unable to deliver recovery email"),
    );
  });
}

export async function resetPassword(token: string, password: string) {
  const user = await userRepository.completePasswordReset(
    tokenHash(token),
    await hashPassword(password),
  );
  if (!user)
    throw httpError(
      400,
      "This reset link has expired or has already been used. Request a new one",
    );
  sendPasswordChangedEmail(user.email).catch(() =>
    console.error(
      "[Password reset] Unable to deliver password-change notification",
    ),
  );
}
