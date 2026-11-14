"use client";
import Image from "next/image";
import { useState } from "react";
import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { kitchenPalette } from "@/data/kitchen-branding";

export function KitchenLogo({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState<string>();
  const palette = kitchenPalette(name);
  const safeSource =
    src?.startsWith("/") && !src.startsWith("//") ? src : undefined;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  return (
    <div
      style={{ backgroundColor: palette.background, color: palette.foreground }}
      className={cn(
        "relative grid size-22 place-items-center overflow-hidden rounded-full border-[5px] border-foodie-paper text-2xl font-medium tracking-tight shadow-[0_4px_16px_#263c3114] sm:size-26",
        className,
      )}
    >
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
export function KitchenBanner({
  src,
  name,
  className,
  priority = false,
  sizes = "(max-width: 639px) 100vw, 1250px",
}: {
  src?: string;
  name: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState<string>();
  const palette = kitchenPalette(name);
  const safeSource =
    src?.startsWith("/") && !src.startsWith("//") ? src : undefined;
  return (
    <div className={cn("relative overflow-hidden bg-foodie-forest", className)}>
      {safeSource && failed !== safeSource ? (
        <Image
          src={safeSource}
          alt={`${name} cover`}
          priority={priority}
          fill
          quality={90}
          sizes={sizes}
          className="object-cover object-[50%_35%]"
          onError={() => setFailed(safeSource)}
        />
      ) : (
        <div
          role="img"
          aria-label={`${name} cover`}
          style={{
            background: `radial-gradient(ellipse at 25% 25%, ${palette.accent}, transparent 70%), ${palette.background}`,
            color: palette.foreground,
          }}
          className="absolute inset-0 isolate overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -right-12 -bottom-24 size-80 rounded-full border border-current opacity-15"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-12 size-72 rotate-45 rounded-[72px] border border-current opacity-10"
          />
          <span className="absolute inset-0 grid place-items-center px-8 text-center font-foodie-display text-[clamp(1.5rem,3vw,2.5rem)] leading-tight italic">
            {name}
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
