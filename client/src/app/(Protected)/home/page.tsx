import { Suspense } from "react";
import HomeDiscovery from "@/components/home/HomeDiscovery";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <p role="status" className="py-12 text-sm text-foodie-muted">
          Getting your next meal ready…
        </p>
      }
    >
      <HomeDiscovery />
    </Suspense>
  );
}
