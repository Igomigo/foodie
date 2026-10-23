"use client";

import { ChevronDown } from "lucide-react";
import FormField, { formControlClassName } from "@/components/shared/FormField";
import { countries, nigeria, localGovernments } from "@/lib/locations";
import type { LocationInput } from "@/lib/location-validation";

export default function LocationPicker({
  value,
  onChange,
  errors = {},
  onBlur,
}: {
  value: LocationInput;
  onChange: (value: LocationInput) => void;
  errors?: Partial<Record<keyof LocationInput, string>>;
  onBlur?: (field: keyof LocationInput) => void;
}) {
  const state = nigeria.states.find((item) => item.name === value.state);
  const selects = [
    {
      name: "country" as const,
      label: "Country",
      hint: "Starting at home. Available in Nigeria.",
      options: [{ value: "Nigeria", label: "🇳🇬 Nigeria" }],
      placeholder: "Nigeria",
      disabled: false,
    },
    {
      name: "state" as const,
      label: "State / FCT",
      hint: "Benin City? Choose Edo. Abuja? Choose Federal Capital Territory.",
      options: nigeria.states.map((item) => ({
        value: item.name,
        label: item.name,
      })),
      placeholder: "Choose your state",
      disabled: false,
    },
    {
      name: "city" as const,
      label: "City or area",
      hint: "Choose the listed city or area where you live.",
      options: (state?.cities ?? []).map((item) => ({
        value: item.name,
        label: item.name,
      })),
      placeholder: state ? "Choose your city or area" : "Select a state first",
      disabled: !state,
    },
    {
      name: "lga" as const,
      label: "Local government area",
      hint: "LGAs in your state. A city can span more than one LGA.",
      options: localGovernments(value.state).map((item) => ({
        value: item.name,
        label: item.name,
      })),
      placeholder: state ? "Choose your LGA" : "Select a state first",
      disabled: !state,
    },
  ];
  return (
    <div className="space-y-4">
      {selects.map((field) => (
        <FormField
          key={field.name}
          id={field.name}
          label={field.label}
          hint={field.hint}
          error={errors[field.name]}
        >
          <div className="relative">
            <select
              id={field.name}
              name={field.name}
              value={value[field.name]}
              required
              disabled={field.disabled}
              onBlur={() => onBlur?.(field.name)}
              onChange={(event) => {
                const next = { ...value, [field.name]: event.target.value };
                if (field.name === "state") {
                  next.city = "";
                  next.lga = "";
                  next.area = "";
                }
                if (
                  (field.name === "city" || field.name === "lga") &&
                  value[field.name]
                )
                  next.area = "";
                onChange(next);
              }}
              className={`${formControlClassName} appearance-none pr-11`}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={`${field.name}-${errors[field.name] ? "error" : "hint"}`}
            >
              <option value="" disabled>
                {field.placeholder}
              </option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              {field.name === "country" && (
                <optgroup label="More countries, later">
                  {countries
                    .filter((country) => country.code !== "NG")
                    .map((country) => (
                      <option key={country.code} disabled value={country.name}>
                        {country.name}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-4.5 right-4 size-4 text-foodie-muted"
            />
          </div>
        </FormField>
      ))}
      <FormField
        id="area"
        label="Neighbourhood / street (optional)"
        hint="For example, GRA or your street name. This helps narrow down your area."
        error={errors.area}
      >
        <input
          id="area"
          name="area"
          autoComplete="address-line1"
          maxLength={100}
          value={value.area}
          onBlur={() => onBlur?.("area")}
          onChange={(event) => onChange({ ...value, area: event.target.value })}
          placeholder="Your part of town"
          className={formControlClassName}
          aria-invalid={Boolean(errors.area)}
          aria-describedby={`area-${errors.area ? "error" : "hint"}`}
        />
      </FormField>
      <p className="text-[9px] leading-relaxed text-foodie-muted">
        Directories:{" "}
        <a
          className="underline underline-offset-2"
          href="https://github.com/dr5hn/countries-states-cities-database"
          target="_blank"
          rel="noreferrer"
        >
          CSC · ODbL
        </a>{" "}
        and{" "}
        <a
          className="underline underline-offset-2"
          href="https://github.com/open-admin-data/nigeria-administrative-divisions"
          target="_blank"
          rel="noreferrer"
        >
          Open Admin Data · CC BY 4.0
        </a>
        .
      </p>
    </div>
  );
}
