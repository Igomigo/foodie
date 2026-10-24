"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Link2Off } from "lucide-react";
import { resetPasswordSchema } from "@/lib/auth-validation";
import { apiErrorMessage } from "@/lib/api-error";
import { useResetPassword } from "@/hooks/useAuth";
import AuthHeading from "@/components/auth/AuthHeading";
import FormError from "@/components/auth/FormError";
import PasswordField from "@/components/shared/PasswordField";
import BrandButton from "@/components/shared/BrandButton";

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const resetPassword = useResetPassword();
  const isSubmitting = resetPassword.isPending;
  const error = resetPassword.error
    ? apiErrorMessage(
        resetPassword.error,
        "We couldn’t reset your password. Please request a new link",
      )
    : "";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    setToken(window.location.hash.slice(1));
  }, []);

  function onSubmit(data: { password: string; confirmPassword: string }) {
    if (!token) return;
    resetPassword.mutate(
      { token, ...data },
      {
        onSuccess: () => {
          window.history.replaceState(null, "", window.location.pathname);
          setComplete(true);
          resetPassword.reset();
        },
      },
    );
  }

  if (token === null)
    return (
      <p role="status" className="text-xs text-foodie-muted">
        Checking your reset link…
      </p>
    );
  if (complete)
    return (
      <div role="status">
        <span className="mb-7 grid size-14 place-items-center rounded-full bg-foodie-sage/50 text-foodie-forest">
          <Check size={25} />
        </span>
        <AuthHeading
          eyebrow="Fresh start. Same good taste."
          title="You’re all"
          accent="set."
        >
          Your password has been updated and your previous sessions signed out.
          Sign in with your new password.
        </AuthHeading>
        <BrandButton href="/auth/login" className="w-full">
          Back to the good stuff
        </BrandButton>
      </div>
    );
  if (!/^[a-f0-9]{64}$/.test(token))
    return (
      <>
        <span className="mb-7 grid size-14 place-items-center rounded-full bg-foodie-action/8 text-foodie-action">
          <Link2Off size={24} strokeWidth={1.5} />
        </span>
        <AuthHeading
          eyebrow="Let’s try that again"
          title="This link needs"
          accent="a fresh start."
        >
          Open the full link from your reset email, or request a new one. We’ll
          help you get back in.
        </AuthHeading>
        <BrandButton href="/auth/forgot-password" className="w-full">
          Get a new reset link
        </BrandButton>
      </>
    );
  return (
    <>
      <AuthHeading
        eyebrow="A fresh start"
        title="New password."
        accent="Same appetite."
      >
        Choose a password you haven’t used before. Then it’s back to finding
        your next favourite.
      </AuthHeading>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        aria-busy={isSubmitting}
      >
        <PasswordField
          required
          id="password"
          label="New password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          {...register("password")}
          error={errors.password?.message}
        />
        <PasswordField
          required
          id="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="One more time"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
        <FormError message={error} />
        <BrandButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating your password…" : "Save my new password"}
        </BrandButton>
      </form>
      <a
        href="/auth/forgot-password"
        className="mt-6 flex min-h-11 items-center justify-center text-xs text-foodie-action hover:underline"
      >
        Need another reset link?
      </a>
    </>
  );
}
