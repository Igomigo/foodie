import { z } from "zod";
import { locationFields, validateLocation } from "./location-validation";

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

export function normalizePhone(phone: string) {
  const digits = phone.replace(/[\s()+-]/g, "");
  return digits.startsWith("0") ? `+234${digits.slice(1)}` : `+${digits}`;
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
        (phone) => /^\+234[789]\d{9}$/.test(normalizePhone(phone)),
        "Enter a valid Nigerian phone number",
      ),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    ...locationFields,
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword)
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    validateLocation(data, context);
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
