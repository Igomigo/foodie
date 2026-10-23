"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { getAccessToken } from "@/config/axios";
import LandingHeader from "./LandingHeader";
import HeroSection from "./HeroSection";
import FlavourStrip from "./FlavourStrip";
import FoodDiscovery from "./FoodDiscovery";
import HowItWorks from "./HowItWorks";
import VendorSection from "./VendorSection";
import LandingFooter from "./LandingFooter";
import FinalCallToAction from "./FinalCallToAction";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      setIsLoggedIn(Boolean(getAccessToken()));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  const exploreHref = isLoggedIn ? "/home" : "/auth/signup";

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-clip bg-foodie-paper text-foodie-ink antialiased [&_a]:touch-manipulation [&_a]:no-underline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-foodie-action [&_button]:cursor-pointer [&_button]:touch-manipulation [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-foodie-action [&_section[id]]:scroll-mt-28">
        <a
          href="#main-content"
          className="fixed -top-20 left-6 z-80 rounded-xl bg-foodie-ink px-6 py-4 text-sm text-white focus:top-4"
        >
          Skip to content
        </a>
        <LandingHeader exploreHref={exploreHref} isLoggedIn={isLoggedIn} />
        <main id="main-content" tabIndex={-1}>
          <HeroSection exploreHref={exploreHref} />
          <FlavourStrip />
          <FoodDiscovery exploreHref={exploreHref} />
          <HowItWorks exploreHref={exploreHref} />
          <VendorSection />
          <FinalCallToAction exploreHref={exploreHref} />
        </main>
        <LandingFooter />
      </div>
    </MotionConfig>
  );
}
