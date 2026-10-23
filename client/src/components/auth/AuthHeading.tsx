import type { ReactNode } from "react";

export default function AuthHeading({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-8">
      <p className="mb-5 flex items-center gap-2.5 text-[9px] font-medium tracking-[.18em] text-foodie-muted uppercase">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-foodie-orange ring-4 ring-foodie-orange/8"
        />
        {eyebrow}
      </p>
      <h1 className="text-[clamp(2.7rem,5vw,3.55rem)] leading-[1.05] font-medium tracking-[-.06em]">
        {title}
        <br />
        <em className="font-foodie-display font-normal text-foodie-action">
          {accent}
        </em>
      </h1>
      <p className="mt-4 max-w-[360px] text-xs leading-[1.9] text-foodie-muted">
        {children}
      </p>
    </div>
  );
}
