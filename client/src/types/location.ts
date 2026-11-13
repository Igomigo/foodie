import type { SavedLocation } from "./user";

export interface AddressSuggestion {
  formattedAddress: string;
  country: "Nigeria";
  countryCode: "NG";
  state?: string;
  city?: string;
  area?: string;
  street?: string;
  houseNumber?: string;
  postcode?: string;
  point: NonNullable<SavedLocation["point"]>;
  precision: "building" | "street" | "place" | "area";
  distanceMeters?: number;
}

export interface LocationAttribution {
  text: string;
  url: string;
}

export interface AddressDraft {
  country: "Nigeria";
  state: string;
  city: string;
  lga: string;
  area: string;
  street1: string;
  street2: string;
  zip: string;
  point?: SavedLocation["point"];
  pointSource?: SavedLocation["pointSource"];
  accuracyMeters?: number;
}
