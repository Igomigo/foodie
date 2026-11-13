"use client";

import { useRef, type ClipboardEvent, type Ref } from "react";
import PhoneInput from "react-phone-input-2";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import { normalizePhone } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";
import FormField, { formControlClassName } from "./FormField";

export default function PhoneField({
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  error,
  disabled = false,
  className,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef?: Ref<HTMLInputElement>;
  error?: string;
  disabled?: boolean;
  className?: string;
}) {
  const country = useRef<CountryCode>(
    parsePhoneNumberFromString(value)?.country ?? "NG",
  );
  const hint = "Choose your country code, then enter your phone number.";

  function pasteNumber(event: ClipboardEvent<HTMLInputElement>) {
    const number = normalizePhone(
      event.clipboardData.getData("text"),
      country.current,
    );
    if (!number) return;
    country.current =
      parsePhoneNumberFromString(number)?.country ?? country.current;
    // Accept pasted local numbers, including Nigeria's leading 0, without duplicating +234.
    event.preventDefault();
    onChange(number);
  }

  return (
    <FormField id={id} label="Phone number" error={error} hint={hint}>
      <PhoneInput
        country="ng"
        preferredCountries={["ng"]}
        value={value}
        onChange={(digits, selected) => {
          if ("countryCode" in selected)
            country.current = selected.countryCode.toUpperCase() as CountryCode;
          // +234 replaces the leading 0 in a local Nigerian number.
          if (country.current === "NG" && digits.startsWith("2340"))
            digits = `234${digits.slice(4)}`;
          onChange(digits ? `+${digits}` : "");
        }}
        onBlur={onBlur}
        disabled={disabled}
        enableSearch
        disableSearchIcon
        specialLabel=""
        searchPlaceholder="Search country"
        searchNotFound="No countries found"
        placeholder="+234 801 234 5678"
        containerClass="font-sans [&_.selected-flag]:w-14 [&_.selected-flag]:rounded-l-xl [&_.selected-flag]:pl-4 [&_.selected-flag]:hover:bg-foodie-paper [&_.selected-flag]:focus-visible:ring-2 [&_.selected-flag]:focus-visible:ring-foodie-action [&_.country]:px-3 [&_.country]:py-2.5 [&_.country.highlight]:bg-foodie-paper [&_.country]:hover:bg-foodie-paper [&_.search]:p-2 [&_.search-box]:m-0 [&_.search-box]:w-full [&_.search-box]:rounded-lg [&_.search-box]:border-foodie-line [&_.search-box]:p-2.5 [&_.search-box]:text-base [&_.search-box]:focus:border-foodie-action"
        inputClass={cn(formControlClassName, "pl-18", className)}
        buttonClass={cn(
          "rounded-l-xl border-foodie-line bg-transparent",
          error && "border-red-600",
        )}
        dropdownClass="w-72 max-w-[calc(100vw-5rem)] max-h-64 rounded-xl border border-foodie-line text-[13px] text-foodie-ink shadow-lg"
        inputProps={{
          id,
          name,
          ref: inputRef ?? undefined,
          required: true,
          autoComplete: "tel",
          inputMode: "tel",
          onPaste: pasteNumber,
          "aria-invalid": !!error,
          "aria-describedby": error ? `${id}-error` : `${id}-hint`,
        }}
      />
    </FormField>
  );
}
