import Link from "next/link";
import { Heart, MoveUpRight } from "lucide-react";
import Brand from "@/components/Brand";

export default function LandingFooter() {
  return (
    <footer className="mx-auto max-w-[1360px] px-6 pt-12 pb-7 sm:px-10 lg:px-14 lg:pt-16">
      <div className="grid grid-cols-[1fr_auto] items-center gap-6 pb-9 sm:flex sm:justify-between">
        <Brand className="col-span-2" />
        {/* <p className="text-[11px] leading-relaxed text-foodie-muted">
          Our food. Our people.
          <br />A little closer to home.
        </p> */}
        <a
          href="#main-content"
          className="flex items-center gap-3 text-[11px] text-foodie-muted"
        >
          Back to top
          <MoveUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-5 border-t border-foodie-line pt-6 text-[10px] text-foodie-muted">
        <p>© {new Date().getFullYear()} Foodie.</p>
        <div className="flex gap-6">
          <Link href="/auth/login" className="hover:text-foodie-action">
            Log in
          </Link>
          <Link href="/auth/vendor-signup" className="hover:text-foodie-action">
            Become a vendor
          </Link>
        </div>
        <span className="flex w-full items-center gap-2 sm:w-auto">
          Made for the love of food
          <Heart size={12} aria-hidden="true" className="text-foodie-action" />
        </span>
      </div>
    </footer>
  );
}
