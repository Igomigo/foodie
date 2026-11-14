"use client";
import Image from "next/image";
import { useState } from "react";
import { Utensils } from "lucide-react";

export function KitchenLogo({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState<string>();
  const safeSource =
    src?.startsWith("/") && !src.startsWith("//") ? src : undefined;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  return (
    <div className="relative grid size-22 place-items-center overflow-hidden rounded-full border-[5px] border-foodie-paper bg-foodie-forest text-2xl font-medium tracking-tight text-foodie-paper shadow-[0_4px_16px_#263c3114] sm:size-26">
      {safeSource && failed !== safeSource ? (
        <Image
          src={safeSource}
          alt={`${name} logo`}
          fill
          sizes="104px"
          className="object-contain"
          onError={() => setFailed(safeSource)}
        />
      ) : (
        <span aria-label={`${name} initials`}>
          {initials || <Utensils size={28} aria-hidden="true" />}
        </span>
      )}
    </div>
  );
}
export function KitchenBanner({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState<string>();
  const safeSource =
    src?.startsWith("/") && !src.startsWith("//") ? src : undefined;
  return (
    <div className="relative h-48 overflow-hidden bg-foodie-forest sm:h-64 lg:h-72">
      {safeSource && failed !== safeSource ? (
        <Image
          src={safeSource}
          alt={`${name} cover photo`}
          priority
          fill
          quality={90}
          sizes="(max-width: 639px) 100vw, 1250px"
          className="object-cover"
          onError={() => setFailed(safeSource)}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_25%_25%,#5c7150,transparent_65%),linear-gradient(120deg,#243a2d,#354938)]"
        >
          <div className="absolute -right-16 -bottom-36 size-96 rounded-full border border-foodie-sage/15" />
          <div className="absolute -right-4 -bottom-24 size-72 rounded-full border border-foodie-sage/15" />
          <span className="absolute top-8 left-8 font-foodie-display text-3xl italic text-foodie-paper/70">
            Good food lives here.
          </span>
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/20"
      />
    </div>
  );
}
