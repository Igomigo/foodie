"use client";

import AIChatModal from "@/components/AIChatModal";
import Sidebar from "@/components/navigation/Sidebar";
import Topbar from "@/components/navigation/Topbar";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAIChatModalOpen, setIsAIChatModalOpen] = useState(false);

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
        <main className="flex-1 mt-16 relative">
          {children}
          {/** AI Chat Button */}
          <div
            className="fixed bottom-3 md:bottom-5 right-[-30px] cursor-pointer hover:scale-110 transition-all duration-300"
            onClick={() => setIsAIChatModalOpen(true)}
          >
            <DotLottieReact
              src="https://lottie.host/b7110cc0-3a48-41ea-a887-4eee1020df90/9iQCOG2VD1.lottie"
              loop
              autoplay
              className="w-50 md:w-55"
            />
          </div>
        </main>
      </div>
      {/** AI Chat Modal */}
      <AIChatModal
        open={isAIChatModalOpen}
        onOpenChange={setIsAIChatModalOpen}
      />
    </div>
  );
}
