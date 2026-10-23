import type { ButtonHTMLAttributes, ComponentProps } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const colours = {
  orange:
    "bg-foodie-action text-white hover:bg-[#ad391a] shadow-[0_6px_18px_#c7472415]",
  dark: "bg-foodie-forest text-foodie-paper hover:bg-[#182a1a]",
  light: "bg-[#e7efcc] text-foodie-forest hover:bg-[#f3facd]",
  outline: "border border-[#7d866d] text-foodie-forest hover:bg-[#e8ebdc]",
};

type BrandButtonProps = {
  variant?: keyof typeof colours;
  size?: "default" | "compact";
} & (
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | ComponentProps<typeof Link>
);

/** Foodie's rounded CTA style, introduced on the landing page. */
export default function BrandButton({
  children,
  className,
  variant = "orange",
  size = "default",
  ...props
}: BrandButtonProps) {
  const classes = cn(
    "group inline-flex min-h-[53px] items-center justify-center gap-6 rounded-full px-6 py-4 text-xs font-semibold transition-[background-color,transform,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action disabled:pointer-events-none disabled:opacity-50",
    colours[variant],
    size === "compact" && "min-h-11 gap-3 px-4 py-3 text-[11px]",
    className,
  );

  const content = (
    <>
      {children}
      <ArrowUpRight
        size={19}
        aria-hidden="true"
        className="transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
      />
    </>
  );

  if (props.href !== undefined) {
    return (
      <Link {...props} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button {...props} type={props.type ?? "button"} className={classes}>
      {content}
    </button>
  );
}
