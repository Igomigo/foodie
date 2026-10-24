"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { loginSchema, type LoginFormData } from "@/lib/auth-validation";
import { apiErrorMessage } from "@/lib/api-error";
import { useLogin } from "@/hooks/useAuth";
import AuthHeading from "@/components/auth/AuthHeading";
import FormError from "@/components/auth/FormError";
import BrandButton from "@/components/shared/BrandButton";
import TextField from "@/components/shared/TextField";
import PasswordField from "@/components/shared/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const isSubmitting = login.isPending;
  const error = login.error
    ? apiErrorMessage(login.error, "We couldn’t sign you in. Please try again")
    : "";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginFormData) {
    login.mutate(data, {
      onSuccess: () => {
        const saved = localStorage.getItem("redirectAfterLogin");
        localStorage.removeItem("redirectAfterLogin");
        const destination =
          saved &&
          /^\/(?!\/)/.test(saved) &&
          !saved.includes("\\") &&
          !saved.startsWith("/auth/")
            ? saved
            : "/home";
        toast.success("Welcome back to Foodie");
        router.replace(destination);
      },
    });
  }

  return (
    <>
      <AuthHeading
        eyebrow="Your table is waiting"
        title="Welcome back."
        accent="Hungry?"
      >
        Your favourites, your local kitchens, your next good meal. Pick up where
        you left off.
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
        <div>
          <PasswordField
            required
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            {...register("password")}
            error={errors.password?.message}
          />
          <div className="mt-3 text-right">
            <Link
              href="/auth/forgot-password"
              className="inline-flex min-h-8 items-center text-[11px] font-medium text-foodie-action hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <FormError message={error} />
        <BrandButton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing you in…" : "Sign in to Foodie"}
        </BrandButton>
      </form>
      <p className="mt-7 text-center text-xs text-foodie-muted">
        New to Foodie?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-foodie-action hover:underline"
        >
          Make yourself at home
        </Link>
      </p>
      <p className="mt-9 border-t border-foodie-line pt-5 text-center text-[10px] text-foodie-muted">
        A good meal is always worth coming back for.
      </p>
    </>
  );
}
