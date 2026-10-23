"use client";
import type { ReactNode } from "react";
import AppShell from "@/components/app/AppShell";
import withAuth from "@/middleware/withAuth";

function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
export default withAuth(ProtectedLayout);
