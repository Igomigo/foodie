"use client";

import { usePathname } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { useProfile } from "@/hooks/useProfile";
import AppHeader from "./AppHeader";
import MobileNavigation from "./MobileNavigation";
import AssistantLauncher from "./AssistantLauncher";
import AIChatModal from "@/components/AIChatModal";

export default function AppShell({ children }: { children: ReactNode }) {
  const kitchenPage = usePathname().startsWith("/kitchens/");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { isError: profileError } = useProfile();
  return (
    <div className="min-h-svh bg-foodie-paper text-foodie-ink selection:bg-foodie-sage">
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-foodie-paper focus:p-3"
      >
        Skip to content
      </a>
      <div className={kitchenPage ? "hidden md:block" : ""}>
        <AppHeader />
      </div>
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
        className={
          kitchenPage
            ? "mx-auto max-w-[1360px] pb-40 outline-none sm:px-10 sm:pt-7 md:pb-28 lg:px-14"
            : "mx-auto max-w-[1360px] px-6 pt-7 pb-40 outline-none sm:px-10 md:pb-28 lg:px-14 lg:pt-10"
        }
      >
        {children}
      </main>
      <AssistantLauncher onOpen={() => setAssistantOpen(true)} />
      <Suspense fallback={null}>
        <MobileNavigation />
      </Suspense>
      <AIChatModal open={assistantOpen} onOpenChange={setAssistantOpen} />
    </div>
  );
}
