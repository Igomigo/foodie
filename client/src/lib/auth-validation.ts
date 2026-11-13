import { z } from "zod";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address");
export const passwordSchema = z
  .string()
  .min(6, "Use at least 6 characters")
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    "Password must be at most 72 bytes",
  );
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginFormData = z.infer<typeof loginSchema>;

export function normalizePhone(
  value: string,
  defaultCountry: CountryCode = "NG",
) {
  const phone = parsePhoneNumberFromString(value, {
    defaultCountry,
    extract: false,
  });
  return phone?.isValid() && !phone.ext ? phone.number : undefined;
}

export const signupSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must have at least 3 characters"),
    email: emailSchema,
    phoneNumber: z
      .string()
      .trim()
      .refine(
        (phone) => !!normalizePhone(phone),
        "Enter a valid phone number for your selected country",
      ),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword)
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
  });
export type SignupFormData = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
