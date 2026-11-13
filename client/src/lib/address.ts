import { z } from "zod";
import { nigeria, localGovernments } from "./locations";
import type { AddressDraft, AddressSuggestion } from "@/types/location";
import type { SavedLocation } from "@/types/user";

export const emptyAddress: AddressDraft = {
  country: "Nigeria",
  state: "",
  city: "",
  lga: "",
  area: "",
  street1: "",
  street2: "",
  zip: "",
};

export function addressFromSuggestion(
  address: AddressSuggestion | null,
): AddressDraft {
  if (!address) return { ...emptyAddress };
  const label = address.state
    ?.toLowerCase()
    .replace(/\s+state$/, "")
    .trim();
  const state = nigeria.states.find(
    (item) =>
      item.name.toLowerCase() === label ||
      item.code.toLowerCase() === label ||
      (item.code === "FC" &&
        ["fct", "abuja", "abuja federal capital territory"].includes(
          label ?? "",
        )),
  );
  let city = address.city ?? "";
  if (state?.code === "ED" && city.toLowerCase() === "benin")
    city = "Benin City";
  return {
    ...emptyAddress,
    state: state?.name ?? "",
    city,
    area: address.area ?? "",
    street1: [address.houseNumber, address.street].filter(Boolean).join(" "),
    zip: address.postcode ?? "",
    point: address.point,
    pointSource: "search",
  };
}

export function addressFromSaved(location: SavedLocation): AddressDraft {
  return {
    ...emptyAddress,
    ...location,
    country: "Nigeria",
    state: location.state,
    city: location.city,
    lga: location.lga ?? "",
    area: location.area ?? "",
    street1: location.street1 ?? "",
    street2: location.street2 ?? "",
    zip: location.zip ?? "",
    pointSource: location.pointSource ?? "pin",
  };
}

export const addressDetailsSchema = z
  .object({
    country: z.literal("Nigeria"),
    street1: z
      .string()
      .trim()
      .min(3, "Add your house number and street, or a helpful landmark")
      .max(200),
    street2: z.string().trim().max(200),
    city: z.string().trim().min(1, "Add your city or town").max(100),
    state: z
      .string()
      .refine(
        (name) => nigeria.states.some((state) => state.name === name),
        "Choose your state",
      ),
    area: z.string().trim().max(100),
    lga: z.string(),
    zip: z.string().trim().max(20),
  })
  .superRefine((value, context) => {
    if (
      value.lga &&
      !localGovernments(value.state).some((lga) => lga.name === value.lga)
    )
      context.addIssue({
        code: "custom",
        path: ["lga"],
        message: "Choose an LGA in your state",
      });
  });
export type AddressDetails = z.infer<typeof addressDetailsSchema>;

export function confirmedAddress(
  details: AddressDetails,
  draft: AddressDraft,
): SavedLocation {
  if (!draft.point || !draft.pointSource)
    throw new Error("Choose your location on the map first.");
  // Explicit fields prevent display labels, old IDs and confirmation metadata being sent back.
  return {
    country: "Nigeria",
    state: details.state,
    city: details.city,
    street1: details.street1,
    street2: details.street2 || undefined,
    area: details.area || undefined,
    lga: details.lga || undefined,
    zip: details.zip || undefined,
    point: draft.point,
    pointSource: draft.pointSource,
    ...(draft.pointSource === "device"
      ? { accuracyMeters: draft.accuracyMeters }
      : {}),
  };
}
