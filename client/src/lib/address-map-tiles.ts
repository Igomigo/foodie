import { isAxiosError } from "axios";
import { getMapTile } from "@/sevices/location.service";

export function createAddressTiles(L: typeof import("leaflet")) {
  const requests = new Map<HTMLElement, AbortController>();
  const sources = new Map<HTMLElement, string>();
  // Image URLs cannot carry our session header. Fetch through the HTTP service.
  const AddressTiles = L.GridLayer.extend({
    createTile: (
      coordinates: import("leaflet").Coords,
      done: import("leaflet").DoneCallback,
    ) => {
      const image = document.createElement("img");
      image.alt = "";
      image.setAttribute("role", "presentation");
      const request = new AbortController();
      requests.set(image, request);
      async function load() {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const blob = await getMapTile(
              coordinates.z,
              coordinates.x,
              coordinates.y,
              request.signal,
            );
            if (request.signal.aborted) return;
            const source = URL.createObjectURL(blob);
            sources.set(image, source);
            image.onload = () => {
              URL.revokeObjectURL(source);
              sources.delete(image);
              done(undefined, image);
            };
            image.onerror = () => {
              URL.revokeObjectURL(source);
              sources.delete(image);
              done(new Error("Map tile unavailable"), image);
            };
            image.src = source;
            return;
          } catch (error) {
            if (request.signal.aborted) return;
            // Retry a transient failure once, but never replay auth or rate-limit failures.
            const status = isAxiosError(error)
              ? error.response?.status
              : undefined;
            if (attempt === 0 && (!status || status >= 500)) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              if (request.signal.aborted) return;
              continue;
            }
            done(new Error("Map tile unavailable"), image);
            return;
          }
        }
      }
      void load();
      return image;
    },
  }) as typeof L.GridLayer;
  const tiles = new AddressTiles({
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · <a href="https://www.geoapify.com/">Geoapify</a>',
    maxZoom: 19,
    keepBuffer: 2,
    updateWhenIdle: false,
    updateInterval: 200,
  });
  tiles.on("tileunload", ({ tile }) => {
    requests.get(tile)?.abort();
    requests.delete(tile);
    const source = sources.get(tile);
    if (source) URL.revokeObjectURL(source);
    sources.delete(tile);
    tile.onload = null;
    tile.onerror = null;
  });
  tiles.on("remove", () => {
    requests.forEach((request) => request.abort());
    sources.forEach((source) => URL.revokeObjectURL(source));
    requests.clear();
    sources.clear();
  });
  return tiles;
}
