import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import FormField, { formControlClassName } from "./FormField";

type SelectFieldProps = ComponentProps<"select"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export default function SelectField({
  id,
  label,
  error,
  hint,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <FormField id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <select
          {...props}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={cn(
            formControlClassName,
            "peer appearance-none pr-12 forced-colors:appearance-auto",
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-foodie-muted peer-disabled:opacity-40 forced-colors:hidden"
        />
      </div>
    </FormField>
  );
}
