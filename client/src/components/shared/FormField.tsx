import type { ReactNode } from "react";

export const formControlClassName =
  "h-13 w-full rounded-xl border border-foodie-line bg-white/65 px-4 text-base text-foodie-ink outline-none transition-[border-color,box-shadow,background-color] placeholder:text-foodie-muted/60 hover:border-foodie-muted/60 focus:border-foodie-action focus:ring-3 focus:ring-foodie-action/10 disabled:cursor-not-allowed disabled:bg-foodie-ink/4 disabled:text-foodie-muted aria-invalid:border-red-600 aria-invalid:focus:ring-red-600/10 sm:text-[13px]";

export default function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium text-foodie-ink"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-[11px] leading-relaxed text-red-700"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="mt-1.5 text-[11px] leading-relaxed text-foodie-muted"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
