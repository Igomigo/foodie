import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignupFormData } from "@/lib/auth-validation";
import TextField from "@/components/shared/TextField";
import PasswordField from "@/components/shared/PasswordField";

export default function SignupDetails({
  register,
  errors,
}: {
  register: UseFormRegister<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
}) {
  return (
    <>
      <TextField
        required
        id="username"
        label="Username"
        autoComplete="username"
        placeholder="What should we call you?"
        {...register("username")}
        error={errors.username?.message}
      />
      <TextField
        required
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <TextField
        required
        id="phoneNumber"
        label="Phone number"
        type="tel"
        autoComplete="tel"
        placeholder="0801 234 5678"
        hint="Use your Nigerian number, starting with 0 or +234."
        {...register("phoneNumber")}
        error={errors.phoneNumber?.message}
      />
      <PasswordField
        required
        id="password"
        label="Password"
        autoComplete="new-password"
        placeholder="Make it a good one"
        hint="At least 6 characters."
        {...register("password")}
        error={errors.password?.message}
      />
      <PasswordField
        required
        id="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        placeholder="One more time"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />
    </>
  );
}
