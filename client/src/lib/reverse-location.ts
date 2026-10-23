import { z } from "zod";
import { nigeria, localGovernments } from "./locations";
import type { LocationInput } from "./location-validation";

export const reverseLocationResponseSchema = z.object({
  countryCode: z.string(),
  principalSubdivision: z.string().optional(),
  principalSubdivisionCode: z.string().optional(),
  city: z.string().optional(),
  locality: z.string().optional(),
  lookupSource: z.string(),
  localityInfo: z
    .object({
      administrative: z
        .array(
          z.object({
            name: z.string(),
            adminLevel: z.number().optional(),
            description: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});
export type ReverseLocationResponse = z.infer<
  typeof reverseLocationResponseSchema
>;

function normalizeName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function lgaName(name: string) {
  return normalizeName(name)
    .replace(
      /\b(local government area|local government|area council|lga)\b/g,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

// Match known labels only. Never guess an LGA from a nearby town or a city name.
export function matchDetectedLocation(
  data: ReverseLocationResponse,
): LocationInput {
  if (data.countryCode?.toUpperCase() !== "NG")
    throw new Error(
      "Foodie is currently available in Nigeria. Please choose your Nigerian discovery area manually.",
    );
  if (!data.lookupSource || /ip/i.test(data.lookupSource))
    throw new Error(
      "We couldn’t confirm your device’s location. Please enter your area manually.",
    );

  const code = data.principalSubdivisionCode?.toUpperCase().replace(/^NG-/, "");
  const name = normalizeName(data.principalSubdivision ?? "")
    .replace(/\bstate\b/g, "")
    .trim();
  const state =
    nigeria.states.find((item) => item.code === code) ??
    nigeria.states.find(
      (item) =>
        normalizeName(item.name) === name ||
        (item.code === "FC" &&
          ["fct", "abuja federal capital territory", "abuja"].includes(name)),
    );
  if (!state)
    throw new Error(
      "We found your position but couldn’t match the state. Please choose your area manually.",
    );

  const cityNames = [data.city, data.locality]
    .filter((item): item is string => Boolean(item))
    .map(normalizeName);
  if (state.code === "ED" && cityNames.includes("benin"))
    cityNames.push("benin city");
  const city = cityNames
    .map((name) =>
      state.cities.find((item) => normalizeName(item.name) === name),
    )
    .find(Boolean);
  const administrative = data.localityInfo?.administrative ?? [];
  const lgaNames = administrative
    .filter(
      (item) =>
        item.adminLevel === 6 ||
        /local government|area council/i.test(item.description ?? ""),
    )
    .map((item) => lgaName(item.name));
  const matches = localGovernments(state.name).filter((item) =>
    lgaNames.includes(lgaName(item.name)),
  );
  const lga = matches.length === 1 ? matches[0] : undefined;
  const locality = data.locality?.trim() ?? "";
  const area = [city?.name, lga?.name, state.name].some(
    (name) => name && normalizeName(name) === normalizeName(locality),
  )
    ? ""
    : locality.slice(0, 100);

  // Missing catalogue matches stay blank, rather than retaining the previous address.
  return {
    country: "Nigeria",
    state: state.name,
    city: city?.name ?? "",
    lga: lga?.name ?? "",
    area,
  };
}
