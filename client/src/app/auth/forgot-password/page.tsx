"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/auth-validation";
import { apiErrorMessage } from "@/lib/api-error";
import { forgotPassword } from "@/sevices/auth.service";
import AuthHeading from "@/components/auth/AuthHeading";
import FormError from "@/components/auth/FormError";
import TextField from "@/components/shared/TextField";
import BrandButton from "@/components/shared/BrandButton";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit({ email }: { email: string }) {
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (error) {
      setError(
        apiErrorMessage(
          error,
          "We couldn’t request a reset link. Please try again",
        ),
      );
    }
  }

  return (
    <>
      {sent ? (
        <div role="status">
          <span className="mb-7 grid size-14 place-items-center rounded-full bg-foodie-sage/50 text-foodie-forest">
            <MailCheck size={25} strokeWidth={1.4} />
          </span>
          <AuthHeading
            eyebrow="One small step back in"
            title="Have a look"
            accent="in your inbox."
          >
            If there’s a Foodie account with that email, we’ll send a link to
            reset your password. Check your spam folder too.
          </AuthHeading>
          <p className="text-xs leading-[1.9] text-foodie-muted">
            The link works once and expires in 20 minutes.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-6 min-h-11 text-xs font-medium text-foodie-action hover:underline"
          >
            Try a different email
          </button>
        </div>
      ) : (
        <>
          <AuthHeading
            eyebrow="No wahala. It happens."
            title="Forgot your"
            accent="password?"
          >
            Let’s get you back to the good stuff. Enter the email you use for
            Foodie.
          </AuthHeading>
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            aria-busy={isSubmitting}
          >
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
            <FormError message={error} />
            <BrandButton
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Requesting your link…" : "Send me a reset link"}
            </BrandButton>
          </form>
        </>
      )}
      <Link
        href="/auth/login"
        className="mt-8 flex min-h-11 items-center justify-center gap-2 text-xs text-foodie-muted hover:text-foodie-action"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to sign in
      </Link>
    </>
  );
}
