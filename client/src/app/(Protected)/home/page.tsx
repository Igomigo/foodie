"use client";

import HeroSection from "@/components/home/HeroSection";
import QuickStatsSection from "@/components/home/QuickStatsSection";
import React from "react";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 bg-gray-100">
      <main className="flex-1 px-4 py-8 bg-white md:px-6 md:py-8 space-y-6">
        {/** Hero Section */}
        <HeroSection />
        {/** Quick Stats Section */}
        <QuickStatsSection />
      </main>
    </div>
  );
}
