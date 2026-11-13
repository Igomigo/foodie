const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getMapTile } = require("../src/location/location.service");

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

test("map tiles validate coordinates before calling the provider", (t) => {
  const fetch = t.mock.method(global, "fetch", async () => {
    throw new Error("Unexpected request");
  });
  for (const values of [
    [20, 0, 0],
    [-1, 0, 0],
    [2.5, 0, 0],
    [2, 4, 0],
    [2, 0, -1],
    [2, NaN, 0],
  ])
    assert.throws(() => getMapTile(...values), { status: 400 });
  assert.equal(fetch.mock.callCount(), 0);
});

test("the server fetches only PNG map tiles and reuses cached public map imagery", async (t) => {
  const previousKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = "synthetic-map-key";
  t.after(() => {
    if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = previousKey;
  });
  const fetch = t.mock.method(global, "fetch", async (url, options) => {
    assert.equal(url.origin, "https://maps.geoapify.com");
    assert.equal(url.pathname, "/v1/tile/positron/3/2/2@2x.png");
    assert.equal(url.searchParams.get("apiKey"), "synthetic-map-key");
    assert.equal(options.redirect, "error");
    return new Response(png, { headers: { "Content-Type": "image/png" } });
  });
  assert.deepEqual(await getMapTile(3, 2, 2), png);
  assert.deepEqual(await getMapTile(3, 2, 2), png);
  assert.equal(fetch.mock.callCount(), 1);
});

test("provider errors and invalid map payloads never escape as credentials or HTML", async (t) => {
  const previousKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = "synthetic-map-key";
  t.after(() => {
    if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = previousKey;
  });
  for (const reply of [
    () => new Response("private-provider-error", { status: 429 }),
    () =>
      new Response("<html>not an image</html>", {
        headers: { "Content-Type": "text/html" },
      }),
    () =>
      new Response("not a PNG", { headers: { "Content-Type": "image/png" } }),
    () => {
      throw new Error("https://provider/?apiKey=synthetic-map-key");
    },
  ]) {
    t.mock.method(global, "fetch", async () => reply());
    await assert.rejects(getMapTile(3, 3, 3), (error) => {
      assert.equal(error.status, 503);
      assert.ok(!error.stack.includes("synthetic-map-key"));
      return true;
    });
  }
});
