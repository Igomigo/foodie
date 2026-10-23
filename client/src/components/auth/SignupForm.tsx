"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Check } from "lucide-react";
import { signupSchema, type SignupFormData } from "@/lib/auth-validation";
import { apiErrorMessage } from "@/lib/api-error";
import { signUp } from "@/sevices/auth.service";
import BrandButton from "@/components/shared/BrandButton";
import AuthHeading from "./AuthHeading";
import FormError from "./FormError";
import SignupDetails from "./SignupDetails";
import LocationFields from "./LocationFields";

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const heading = useRef<HTMLDivElement>(null);
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      country: "Nigeria",
      state: "",
      city: "",
      lga: "",
      area: "",
    },
  });
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (step === 2) heading.current?.focus();
  }, [step]);

  async function nextStep(event: FormEvent) {
    event.preventDefault();
    if (
      await trigger(
        ["username", "email", "phoneNumber", "password", "confirmPassword"],
        { shouldFocus: true },
      )
    )
      setStep(2);
  }

  async function onSubmit(data: SignupFormData) {
    setError("");
    try {
      await signUp(data);
      toast.success("You’re in. Sign in to find your next favourite");
      router.replace("/auth/login");
    } catch (error) {
      setError(
        apiErrorMessage(
          error,
          "We couldn’t create your account. Please try again",
        ),
      );
    }
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-3 text-[10px]">
        <span className="flex items-center gap-2 font-medium">
          <span className="grid size-6 place-items-center rounded-full bg-foodie-forest text-foodie-paper">
            {step === 2 ? <Check size={12} /> : "01"}
          </span>
          Your details
        </span>
        <span className="h-px flex-1 bg-foodie-line" />
        <span
          aria-current={step === 2 ? "step" : undefined}
          className="flex items-center gap-2 text-foodie-muted"
        >
          <span
            className={`grid size-6 place-items-center rounded-full border ${step === 2 ? "border-foodie-forest bg-foodie-forest text-foodie-paper" : "border-foodie-line"}`}
          >
            02
          </span>
          Your neighbourhood
        </span>
      </div>
      <div ref={heading} tabIndex={-1} className="outline-none">
        {step === 1 ? (
          <AuthHeading
            eyebrow="A seat at the table"
            title="Good food days"
            accent="start here."
          >
            A few details, a whole lot to look forward to. Let’s make you a
            Foodie.
          </AuthHeading>
        ) : (
          <AuthHeading
            eyebrow="Make it local"
            title="Good food."
            accent="Closer to you."
          >
            Where should we look for your next good meal?
          </AuthHeading>
        )}
      </div>
      <form
        noValidate
        onSubmit={
          step === 1
            ? nextStep
            : handleSubmit(onSubmit, (errors) => {
                const first = Object.keys(errors)[0];
                if (first) document.getElementById(first)?.focus();
              })
        }
        className="space-y-5"
        aria-busy={isSubmitting}
      >
        <fieldset disabled={isSubmitting} className="space-y-4.5">
          <legend className="sr-only">
            {step === 1 ? "Your account details" : "Your location"}
          </legend>
          {step === 1 ? (
            <SignupDetails register={register} errors={errors} />
          ) : (
            <LocationFields form={form} />
          )}
        </fieldset>
        <FormError message={error} />
        <BrandButton type="submit" className="w-full" disabled={isSubmitting}>
          {step === 1
            ? "Find my neighbourhood"
            : isSubmitting
              ? "Making room for you…"
              : "Create my account"}
        </BrandButton>
        {step === 2 && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setStep(1)}
            className="mx-auto flex min-h-10 items-center gap-2 text-[11px] text-foodie-muted hover:text-foodie-action"
          >
            <ArrowLeft size={14} />
            Back to my details
          </button>
        )}
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
