"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signupSchema, type SignupFormData } from "@/lib/auth-validation";
import { apiErrorMessage } from "@/lib/api-error";
import { useSignup, useLogin } from "@/hooks/useAuth";
import BrandButton from "@/components/shared/BrandButton";
import AuthHeading from "./AuthHeading";
import FormError from "./FormError";
import SignupDetails from "./SignupDetails";

export default function SignupForm() {
  const router = useRouter();
  const signup = useSignup();
  const login = useLogin();
  const pending = signup.isPending || login.isPending;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: SignupFormData) {
    signup.mutate(data, {
      onSuccess: () =>
        login.mutate(
          { email: data.email, password: data.password },
          {
            onSuccess: () => {
              toast.success("Welcome to Foodie. Let’s find your corner.");
              router.replace("/location");
            },
            onError: () => {
              toast.success("Your account is ready. Sign in to continue.");
              router.replace("/auth/login");
            },
          },
        ),
    });
  }

  return (
    <>
      <div className="mb-7 flex items-center gap-3 text-[10px] text-foodie-muted">
        <span className="flex items-center gap-2 text-foodie-ink">
          <span className="grid size-6 place-items-center rounded-full bg-foodie-forest text-foodie-paper">
            01
          </span>
          Your details
        </span>
        <span className="h-px flex-1 bg-foodie-line" />
        <span>02 · Your location</span>
      </div>
      <AuthHeading
        eyebrow="A seat at the table"
        title="Good food days"
        accent="start here."
      >
        A few details, then we’ll find your corner of the map.
      </AuthHeading>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        aria-busy={pending}
      >
        <fieldset disabled={pending} className="space-y-4.5">
          <legend className="sr-only">Your account details</legend>
          <SignupDetails
            register={register}
            control={control}
            errors={errors}
            disabled={pending}
          />
        </fieldset>
        <FormError
          message={
            signup.error
              ? apiErrorMessage(
                  signup.error,
                  "We couldn’t create your account. Please try again.",
                )
              : ""
          }
        />
        <BrandButton type="submit" className="w-full" disabled={pending}>
          {login.isPending
            ? "Getting your place ready…"
            : signup.isPending
              ? "Making room for you…"
              : "Create my account"}
        </BrandButton>
      </form>
      <p className="mt-6 text-center text-xs text-foodie-muted">
        Already a Foodie?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-foodie-action hover:underline"
        >
          Come on in
        </Link>
      </p>
    </>
  );
}
