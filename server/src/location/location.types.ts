export interface Coordinates {
  latitude: number;
  longitude: number;
}

// A lookup suggestion must be reviewed by the customer before it is saved.
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
  point: { type: "Point"; coordinates: [number, number] };
  precision: "building" | "street" | "place" | "area";
  distanceMeters?: number;
}
