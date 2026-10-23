"use client";

import { useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { ProfileProvider, useProfile } from "./ProfileContext";
import AppHeader from "./AppHeader";
import MobileNavigation from "./MobileNavigation";
import { assistantName } from "@/data/assistant";
import AIChatModal from "@/components/AIChatModal";

function AppContent({ children }: { children: ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { profileError } = useProfile();
  return (
    <div className="min-h-svh bg-foodie-paper text-foodie-ink selection:bg-foodie-sage">
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-foodie-paper focus:p-3"
      >
        Skip to content
      </a>
      <AppHeader />
      {profileError && (
        <p
          role="status"
          className="mx-auto max-w-[1248px] px-6 pt-4 text-xs text-foodie-muted"
        >
          We couldn’t refresh your profile. Showing your saved details for now.
        </p>
      )}
      <main
        id="app-content"
        tabIndex={-1}
        className="mx-auto max-w-[1360px] px-6 pt-7 pb-40 outline-none sm:px-10 md:pb-28 lg:px-14 lg:pt-10"
      >
        {children}
      </main>
      <button
        type="button"
        onClick={() => setAssistantOpen(true)}
        className="group fixed right-5 bottom-24 z-20 flex min-h-13 items-center gap-2.5 rounded-full border border-foodie-sage/20 bg-foodie-forest px-5 text-xs font-medium text-foodie-paper shadow-[0_8px_32px_#263c3130] transition-colors hover:bg-foodie-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action md:right-8 md:bottom-7"
      >
        <Sparkles size={18} strokeWidth={1.5} aria-hidden="true" />
        Ask {assistantName}
        <span
          className="size-1.5 rounded-full bg-foodie-sage"
          aria-hidden="true"
        />
      </button>
      <MobileNavigation />
      <AIChatModal open={assistantOpen} onOpenChange={setAssistantOpen} />
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <AppContent>{children}</AppContent>
    </ProfileProvider>
  );
}
