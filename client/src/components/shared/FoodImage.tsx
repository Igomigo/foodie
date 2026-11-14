"use client";
import Image from "next/image";
import { Utensils } from "lucide-react";
import { useState } from "react";

export default function FoodImage({
  src,
  alt,
  sizes,
  contain = false,
  priority = false,
}: {
  src?: string;
  alt: string;
  sizes: string;
  contain?: boolean;
  priority?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  // Vendor images are served through the application's image host for now.
  const safeSource =
    src?.startsWith("/") && !src.startsWith("//") ? src : undefined;
  return safeSource && safeSource !== failedSource ? (
    <Image
      src={safeSource}
      alt={alt}
      fill
      quality={90}
      sizes={sizes}
      priority={priority}
      className={contain ? "object-contain p-3" : "object-cover"}
      onError={() => setFailedSource(safeSource)}
    />
  ) : (
    <span
      role="img"
      aria-label={alt}
      className="absolute inset-0 grid place-items-center text-foodie-forest/30"
    >
      <Utensils size={36} strokeWidth={1} aria-hidden="true" />
    </span>
  );
}
