import Link from "next/link";
import { CookingPot } from "lucide-react";
import AuthHeading from "@/components/auth/AuthHeading";
import BrandButton from "@/components/shared/BrandButton";

export default function VendorSignupPage() {
  return (
    <>
      <span className="mb-7 grid size-14 place-items-center rounded-full bg-foodie-sage/50 text-foodie-forest">
        <CookingPot size={25} strokeWidth={1.4} aria-hidden="true" />
      </span>
      <AuthHeading
        eyebrow="For the flavour makers"
        title="Your kitchen."
        accent="Their next favourite."
      >
        We’re making room for the kitchens that make a neighbourhood feel like
        home.
      </AuthHeading>
      <p className="mb-7 rounded-2xl border border-foodie-line p-4 text-xs leading-[1.9] text-foodie-muted">
        Vendor registration is coming next. For now, you can join Foodie as a
        customer and get a taste of what’s cooking.
      </p>
      <BrandButton href="/auth/signup" className="w-full">
        Join Foodie as a customer
      </BrandButton>
      <p className="mt-6 text-center text-xs text-foodie-muted">
        Already a Foodie?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-foodie-action hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
