import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import type { SignupFormData } from "@/lib/auth-validation";
import TextField from "@/components/shared/TextField";
import PasswordField from "@/components/shared/PasswordField";
import PhoneField from "@/components/shared/PhoneField";

export default function SignupDetails({
  register,
  errors,
  control,
  disabled,
}: {
  register: UseFormRegister<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  control: Control<SignupFormData>;
  disabled: boolean;
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
      <Controller
        name="phoneNumber"
        control={control}
        render={({ field }) => (
          <PhoneField
            id="phoneNumber"
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            disabled={disabled}
            error={errors.phoneNumber?.message}
          />
        )}
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
