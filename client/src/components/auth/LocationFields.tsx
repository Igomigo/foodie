"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import type { SignupFormData } from "@/lib/auth-validation";
import LocationPicker from "@/components/location/LocationPicker";

export default function LocationFields({
  form,
}: {
  form: UseFormReturn<SignupFormData>;
}) {
  const [country, state, city, lga, area] = useWatch({
    control: form.control,
    name: ["country", "state", "city", "lga", "area"],
  });
  const { errors } = form.formState;
  return (
    <LocationPicker
      value={{ country, state, city, lga, area }}
      errors={{
        country: errors.country?.message,
        state: errors.state?.message,
        city: errors.city?.message,
        lga: errors.lga?.message,
        area: errors.area?.message,
      }}
      onBlur={(field) => {
        void form.trigger(field);
      }}
      onChange={(next) => {
        form.setValue("country", next.country, { shouldDirty: true });
        form.setValue("state", next.state, { shouldDirty: true });
        form.setValue("city", next.city, { shouldDirty: true });
        form.setValue("lga", next.lga, { shouldDirty: true });
        form.setValue("area", next.area, { shouldDirty: true });
      }}
    />
  );
}
