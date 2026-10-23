import nodemailer from "nodemailer";
import { httpError } from "./httpError";

export function createMailTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM } =
    process.env;
  const port = Number(SMTP_PORT || 587);
  if (
    !SMTP_HOST ||
    !SMTP_USER ||
    !SMTP_PASSWORD ||
    !MAIL_FROM ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw httpError(
      503,
      "Password recovery is temporarily unavailable. Please try again later",
    );
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export async function sendPasswordResetEmail(to: string, url: string) {
  await createMailTransport().sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Reset your Foodie password",
    text: `Let's get you back to the good stuff.\n\nReset your Foodie password: ${url}\n\nThis link expires in 20 minutes and works once. If you didn't request it, you can ignore this email.`,
  });
}

export async function sendPasswordChangedEmail(to: string) {
  await createMailTransport().sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Your Foodie password has changed",
    text: "Your Foodie password has been reset and your previous sessions have been signed out. If you did not make this change, request another reset from the Foodie sign-in page immediately.",
  });
}
