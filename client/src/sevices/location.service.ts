import {
  matchDetectedLocation,
  reverseLocationResponseSchema,
} from "../lib/reverse-location";

// Free endpoint: live device coordinates only, called directly from this browser.
// Do not reuse it for stored coordinates, server-side lookups or background polling.
export async function lookupDeviceLocation(
  position: GeolocationPosition,
  signal: AbortSignal,
) {
  const { latitude, longitude, accuracy } = position.coords;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > 5000
  ) {
    throw new Error(
      "Your device’s location is too approximate. Try again on your phone, or choose your area manually.",
    );
  }
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "en",
  });
  let response: Response;
  try {
    response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`,
      {
        signal,
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "origin",
      },
    );
  } catch {
    throw new Error(
      "We couldn’t connect to the area lookup. Check your connection or choose your area manually.",
    );
  }
  if (!response.ok)
    throw new Error(
      "We couldn’t look up your area right now. Try again or choose it manually.",
    );
  const payload: unknown = await response.json().catch(() => null);
  const result = reverseLocationResponseSchema.safeParse(payload);
  if (!result.success)
    throw new Error(
      "We couldn’t read the area lookup. Please choose your area manually.",
    );
  return matchDetectedLocation(result.data);
}
