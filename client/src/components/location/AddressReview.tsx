"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, MapPin, ShieldCheck } from "lucide-react";
import { addressDetailsSchema, type AddressDetails } from "@/lib/address";
import { nigeria, localGovernments } from "@/lib/locations";
import type { AddressDraft } from "@/types/location";
import TextField from "@/components/shared/TextField";
import FormField, { formControlClassName } from "@/components/shared/FormField";
import BrandButton from "@/components/shared/BrandButton";

export default function AddressReview({
  draft,
  addressUpdate,
  lookingUp,
  pinEditing,
  pending,
  error,
  onSubmit,
  onDifferentAddress,
  onRegionChange,
}: {
  draft: AddressDraft;
  addressUpdate: AddressDraft | null;
  lookingUp: boolean;
  pinEditing: boolean;
  pending: boolean;
  error: string;
  onSubmit: (details: AddressDetails) => void;
  onDifferentAddress: () => void;
  onRegionChange: () => void;
}) {
  const [more, setMore] = useState(
    !!(draft.street2 || draft.lga || draft.area || draft.zip),
  );
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<AddressDetails>({
    resolver: zodResolver(addressDetailsSchema),
    defaultValues: draft,
  });
  useEffect(() => {
    if (!addressUpdate) return;
    // Apartment/instructions belong to the customer, not the map provider.
    reset({ ...addressUpdate, street2: getValues("street2") });
  }, [addressUpdate, reset, getValues]);
  const state = watch("state");
  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-busy={pending || lookingUp}
      className="space-y-5"
    >
      <fieldset disabled={pending || lookingUp} className="space-y-4">
        <legend className="sr-only">Confirm your address details</legend>
        <TextField
          id="street1"
          label="House number & street"
          placeholder="e.g. 12 Airport Road"
          hint="No house number? Add a clear street or landmark."
          autoComplete="address-line1"
          required
          maxLength={200}
          {...register("street1")}
          error={errors.street1?.message}
        />
        <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
          <TextField
            id="address-city"
            label="City or town"
            placeholder="Your city"
            autoComplete="address-level2"
            required
            maxLength={100}
            {...register("city", {
              onBlur: () => {
                if (watch("city") !== draft.city) onRegionChange();
              },
            })}
            error={errors.city?.message}
          />
          <FormField
            id="address-state"
            label="State / FCT"
            error={errors.state?.message}
          >
            <select
              id="address-state"
              autoComplete="address-level1"
              className={formControlClassName}
              aria-invalid={!!errors.state}
              {...register("state", {
                onChange: () => {
                  setValue("lga", "");
                  onRegionChange();
                },
              })}
            >
              <option value="">Choose state</option>
              {nigeria.states.map((item) => (
                <option key={item.code} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <button
          type="button"
          aria-expanded={more}
          aria-controls="address-extra"
          onClick={() => setMore(!more)}
          className="flex min-h-11 w-full items-center justify-between gap-3 border-y border-foodie-line/75 py-3 text-left text-xs text-foodie-muted"
        >
          <span>
            Apartment, neighbourhood & other details{" "}
            <span className="text-[10px]">(optional)</span>
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 transition-transform motion-reduce:transition-none ${more ? "rotate-180" : ""}`}
          />
        </button>
        <div id="address-extra" hidden={!more} className="space-y-4">
          <TextField
            id="street2"
            label="Apartment / extra address details"
            autoComplete="address-line2"
            placeholder="e.g. Flat 2, beside the pharmacy"
            maxLength={200}
            {...register("street2")}
            error={errors.street2?.message}
          />
          <TextField
            id="address-area"
            label="Neighbourhood"
            placeholder="e.g. GRA"
            maxLength={100}
            {...register("area")}
            error={errors.area?.message}
          />
          <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
            <FormField
              id="address-lga"
              label="Local government area"
              error={errors.lga?.message}
            >
              <select
                id="address-lga"
                className={formControlClassName}
                {...register("lga")}
              >
                <option value="">Not added</option>
                {localGovernments(state).map((lga) => (
                  <option key={lga.id} value={lga.name}>
                    {lga.name}
                  </option>
                ))}
              </select>
            </FormField>
            <TextField
              id="address-postcode"
              label="Postcode"
              placeholder="If you know it"
              autoComplete="postal-code"
              maxLength={20}
              {...register("zip")}
              error={errors.zip?.message}
            />
          </div>
        </div>
      </fieldset>
      <p
        role="status"
        className="flex items-start gap-2 text-[11px] leading-relaxed text-foodie-muted"
      >
        <MapPin
          size={14}
          className="mt-0.5 shrink-0 text-foodie-action"
          aria-hidden="true"
        />
        {lookingUp
          ? "Finding the address beneath your pin…"
          : pinEditing
            ? "Finish checking your map pin before confirming."
            : !draft.point
              ? "Choose a pin on the map for this address."
              : "Check that the pin and address both point to the place you have in mind."}
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-xs leading-relaxed text-red-700"
        >
          {error}
        </p>
      )}
      <BrandButton
        type="submit"
        className="w-full"
        disabled={pending || lookingUp || pinEditing || !draft.point}
      >
        {pending ? "Saving your address…" : "Confirm this address"}
      </BrandButton>
      <button
        type="button"
        disabled={pending}
        onClick={onDifferentAddress}
        className="mx-auto block min-h-10 text-xs text-foodie-muted hover:text-foodie-action"
      >
        Choose a different address
      </button>
      <p className="flex items-center justify-center gap-2 text-[10px] text-foodie-muted">
        <ShieldCheck size={13} aria-hidden="true" />
        Saved only when you confirm.
      </p>
    </form>
  );
}
