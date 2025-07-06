"use client";

import Sidebar from "@/components/navigation/Sidebar";
import Topbar from "@/components/navigation/Topbar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/** Sidebar */}
      <div className="fixed top-0 left-0 z-50">
        <Sidebar />
      </div>

      {/** Main Content area */}
      <div className="flex flex-col flex-1 transition-all duration-500 md:ml-64">
        {/** Topbar */}
        <Topbar />
        <main className="flex-1 mt-16">{children}</main>
      </div>
    </div>
  );
}
