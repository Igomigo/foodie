import { httpError } from "../utils/httpError";

const tiles = new Map<string, { image: Buffer; expiresAt: number }>();
const pendingTiles = new Map<string, Promise<Buffer>>();
let nextTileRequestAt = 0;
let allowanceStartedAt = Date.now();
let providerRequests = 0;

export async function fetchGeoapifyTile(z: number, x: number, y: number) {
  const key = `${z}/${x}/${y}`;
  const cached = tiles.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.image;
  const pending = pendingTiles.get(key);
  if (pending) return pending;
  const request = requestTile(key);
  pendingTiles.set(key, request);
  try {
    return await request;
  } finally {
    pendingTiles.delete(key);
  }
}

async function requestTile(key: string): Promise<Buffer> {
  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!apiKey) throw httpError(503, "Map is not configured");

  // Geoapify permits four tile requests per credit: 10 tiles/sec leaves headroom
  // below the free plan's 20 tiles/sec equivalent. Cache hits never enter this queue.
  const now = Date.now();
  const wait = Math.max(0, nextTileRequestAt - now);
  if (wait > 5000)
    throw httpError(503, "Map is busy. Please try again shortly");
  if (now - allowanceStartedAt >= 24 * 60 * 60_000) {
    allowanceStartedAt = now;
    providerRequests = 0;
  }
  // At 0.25 credits/tile this reserves 500 credits beside the geocoding allowance.
  if (providerRequests >= 2000)
    throw httpError(503, "Map is unavailable for now. Please try again later");
  providerRequests++;
  nextTileRequestAt = Math.max(now, nextTileRequestAt) + 100;
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));

  const url = new URL(
    `https://maps.geoapify.com/v1/tile/osm-bright/${key}@2x.png`,
  );
  url.searchParams.set("apiKey", apiKey);
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      redirect: "error",
    });
    if (
      !response.ok ||
      !response.headers.get("content-type")?.startsWith("image/png")
    )
      throw new Error("Map tile unavailable");
    const image = Buffer.from(await response.arrayBuffer());
    if (
      image.length > 512_000 ||
      !image
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      throw new Error("Invalid map tile");
    // Bounded cache reduces repeated provider calls without storing customer addresses.
    tiles.delete(key);
    if (tiles.size >= 64) tiles.delete(tiles.keys().next().value!);
    tiles.set(key, { image, expiresAt: Date.now() + 60 * 60_000 });
    return image;
  } catch {
    throw httpError(503, "Map is temporarily unavailable");
  }
}
