import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import FormField, { formControlClassName } from "./FormField";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export default function TextField({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: TextFieldProps) {
  return (
    <FormField id={id} label={label} error={error} hint={hint}>
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={cn(formControlClassName, className)}
      />
    </FormField>
  );
}
