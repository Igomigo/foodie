import Joi from "joi";
import { httpError } from "../utils/httpError";
import type { AddressSuggestion, Coordinates } from "./location.types";

interface GeoapifyAddress {
  formatted: string;
  country_code: string;
  state?: string;
  city?: string;
  suburb?: string;
  quarter?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  lon: number;
  lat: number;
  result_type?: string;
  distance?: number;
}

const addressSchema = Joi.object({
  formatted: Joi.string().trim().required(),
  country_code: Joi.string().trim().required(),
  state: Joi.string().trim(),
  city: Joi.string().trim(),
  suburb: Joi.string().trim(),
  quarter: Joi.string().trim(),
  street: Joi.string().trim(),
  housenumber: Joi.string().trim(),
  postcode: Joi.string().trim(),
  lon: Joi.number().min(-180).max(180).required(),
  lat: Joi.number().min(-90).max(90).required(),
  result_type: Joi.string(),
  distance: Joi.number().min(0),
}).unknown(true);

const responseSchema = Joi.object({
  results: Joi.array().items(addressSchema).required(),
}).unknown(true);

export const geoapifyAttribution = {
  text: "Powered by Geoapify · © OpenStreetMap contributors",
  url: "https://www.geoapify.com/",
};

function toAddressSuggestion(address: GeoapifyAddress): AddressSuggestion {
  let precision: AddressSuggestion["precision"] = "area";
  if (address.result_type === "building") precision = "building";
  else if (address.result_type === "street") precision = "street";
  else if (address.result_type === "amenity") precision = "place";

  return {
    formattedAddress: address.formatted,
    country: "Nigeria",
    countryCode: "NG",
    state: address.state,
    city: address.city,
    area: address.suburb || address.quarter,
    street: address.street,
    houseNumber: address.housenumber,
    postcode: address.postcode,
    point: { type: "Point", coordinates: [address.lon, address.lat] },
    precision,
    distanceMeters: address.distance,
  };
}

async function requestAddresses(
  endpoint: "autocomplete" | "reverse",
  parameters: Record<string, string>,
): Promise<AddressSuggestion[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!apiKey) throw httpError(503, "Location lookup is not configured");

  const url = new URL(`https://api.geoapify.com/v1/geocode/${endpoint}`);
  url.search = new URLSearchParams({
    ...parameters,
    format: "json",
    lang: "en",
    apiKey,
  }).toString();

  // Provider errors can contain the request URL (including the key/address).
  // Replace them here rather than forwarding or logging their raw contents.
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      redirect: "error",
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Location provider unavailable");

    const payload: unknown = await response.json();
    const { error, value } = responseSchema.validate(payload, {
      convert: false,
    });
    if (error) throw new Error("Invalid location provider response");

    const results = value.results as GeoapifyAddress[];
    return results
      .filter((address) => address.country_code.toLowerCase() === "ng")
      .map(toAddressSuggestion);
  } catch {
    throw httpError(503, "Location lookup is temporarily unavailable");
  }
}

export function searchGeoapifyAddresses(text: string) {
  return requestAddresses("autocomplete", {
    text,
    filter: "countrycode:ng",
    limit: "5",
    // Prevent the provider from inferring a bias from our server's IP address.
    bias: "countrycode:ng",
  });
}

export async function reverseGeoapifyCoordinates(coordinates: Coordinates) {
  const addresses = await requestAddresses("reverse", {
    lat: String(coordinates.latitude),
    lon: String(coordinates.longitude),
    limit: "1",
  });
  return addresses[0] ?? null;
}
