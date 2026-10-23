import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Brand from "@/components/Brand";
import AuthArtwork from "./AuthArtwork";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-foodie-paper text-foodie-ink selection:bg-foodie-sage">
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-foodie-paper focus:p-3"
      >
        Skip to form
      </a>
      <div className="mx-auto grid min-h-svh max-w-[1800px] lg:grid-cols-[.95fr_1.05fr] lg:gap-3 lg:p-4">
        <AuthArtwork />
        <div className="flex min-w-0 flex-col">
          <header className="flex h-24 shrink-0 items-center justify-between gap-4 px-6 sm:px-10 lg:h-17 lg:justify-end lg:px-8">
            <div className="lg:hidden">
              <Brand />
            </div>
            <Link
              href="/"
              className="flex min-h-11 items-center gap-2 text-[11px] text-foodie-muted hover:text-foodie-action"
            >
              Back to the good stuff
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </header>
          <div className="relative mx-6 h-23 shrink-0 overflow-hidden rounded-2xl bg-foodie-forest px-5 py-4 text-foodie-paper sm:mx-10 lg:hidden">
            <p className="text-[8px] tracking-[.18em] text-foodie-sage uppercase">
              Our food. Our people.
            </p>
            <p className="relative z-10 mt-1 font-foodie-display text-[22px] leading-[1.1] italic">
              A little closer
              <br />
              to home.
            </p>
            <Image
              src="/images/landing-jollof.png"
              alt=""
              width={170}
              height={170}
              sizes="150px"
              className="absolute -top-7 -right-14 w-38 -rotate-12 opacity-80"
            />
          </div>
          <main
            id="auth-content"
            tabIndex={-1}
            className="flex flex-1 items-center px-6 py-8 outline-none sm:px-10 lg:py-10"
          >
            <div className="mx-auto w-full max-w-[420px]">{children}</div>
          </main>
          <footer className="flex shrink-0 items-center justify-between gap-4 px-6 py-6 text-[10px] text-foodie-muted sm:px-10 lg:px-8">
            <span>© {new Date().getFullYear()} Foodie.</span>
            <span>Good taste starts here.</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
