const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const {
  searchAddresses,
  reverseGeocode,
  locationAttribution,
} = require("../src/location/location.service");

// Synthetic responses only: tests never use a real API key or device position.
const address = {
  formatted: "12 Test Street, Benin City, Nigeria",
  country_code: "ng",
  state: "Edo",
  city: "Benin City",
  suburb: "Test area",
  street: "Test Street",
  housenumber: "12",
  postcode: "300001",
  lon: 5.6,
  lat: 6.3,
  result_type: "building",
  distance: 18,
  county: "An unverified county label",
  datasource: { internal: "provider metadata" },
};
let previousKey;

beforeEach(() => {
  previousKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = "synthetic-test-key";
});

afterEach(() => {
  if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY;
  else process.env.GEOAPIFY_API_KEY = previousKey;
});

function mockResponse(t, results, status = 200) {
  return t.mock.method(global, "fetch", async () =>
    Response.json({ results }, { status }),
  );
}

test("search restricts suggestions to Nigeria and returns Foodie's address format", async (t) => {
  const fetch = mockResponse(t, [address]);
  const results = await searchAddresses("  Test Street, Benin City  ");
  assert.deepEqual(results, [
    {
      formattedAddress: address.formatted,
      country: "Nigeria",
      countryCode: "NG",
      state: "Edo",
      city: "Benin City",
      area: "Test area",
      street: "Test Street",
      houseNumber: "12",
      postcode: "300001",
      point: { type: "Point", coordinates: [5.6, 6.3] },
      precision: "building",
      distanceMeters: 18,
    },
  ]);
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url.origin, "https://api.geoapify.com");
  assert.equal(url.pathname, "/v1/geocode/autocomplete");
  assert.equal(url.searchParams.get("text"), "Test Street, Benin City");
  assert.equal(url.searchParams.get("filter"), "countrycode:ng");
  assert.equal(url.searchParams.get("bias"), "countrycode:ng");
  assert.equal(url.searchParams.get("limit"), "5");
  assert.equal(url.searchParams.get("format"), "json");
  assert.equal(url.searchParams.get("apiKey"), "synthetic-test-key");
  assert.equal(options.redirect, "error");
  assert.equal(options.cache, "no-store");
  assert.ok(options.signal instanceof AbortSignal);
  assert.ok(locationAttribution.text.includes("Geoapify"));
  assert.ok(locationAttribution.text.includes("OpenStreetMap"));
});

test("reverse lookup keeps the matched point distinct from the submitted device position", async (t) => {
  const fetch = mockResponse(t, [address]);
  const result = await reverseGeocode({ latitude: 6.31, longitude: 5.61 });
  const [url] = fetch.mock.calls[0].arguments;
  assert.equal(url.pathname, "/v1/geocode/reverse");
  assert.equal(url.searchParams.get("lat"), "6.31");
  assert.equal(url.searchParams.get("lon"), "5.61");
  assert.equal(url.searchParams.get("limit"), "1");
  assert.deepEqual(result.point.coordinates, [5.6, 6.3]);
  assert.equal(result.distanceMeters, 18);
  assert.equal(result.accuracyMeters, undefined);
});

test("partial results remain partial without fabricated house numbers or LGA codes", async (t) => {
  for (const [result_type, precision] of [
    ["street", "street"],
    ["amenity", "place"],
    ["city", "area"],
    ["unknown", "area"],
  ]) {
    mockResponse(t, [
      {
        formatted: "Benin City, Nigeria",
        country_code: "ng",
        lat: 6.3,
        lon: 5.6,
        result_type,
        county: "Unverified county",
      },
    ]);
    const [result] = await searchAddresses("Benin City");
    assert.equal(result.precision, precision);
    for (const field of [
      "houseNumber",
      "street",
      "city",
      "state",
      "lga",
      "lgaCode",
      "cityId",
    ])
      assert.equal(result[field], undefined);
  }
});

test("foreign results are excluded even if returned by the provider", async (t) => {
  mockResponse(t, [{ ...address, country_code: "gh" }]);
  assert.deepEqual(await searchAddresses("Test Street"), []);
  assert.equal(await reverseGeocode({ latitude: 5.6, longitude: -0.2 }), null);
});

test("empty provider results are a valid no-match result", async (t) => {
  mockResponse(t, []);
  assert.deepEqual(await searchAddresses("Unlisted road"), []);
  assert.equal(await reverseGeocode({ latitude: 0, longitude: 0 }), null);
});

test("invalid inputs are rejected before spending provider requests", (t) => {
  const fetch = mockResponse(t, []);
  for (const text of [undefined, null, 42, [], "  ", "ab", "x".repeat(201)])
    assert.throws(() => searchAddresses(text), { status: 400 });
  for (const coordinates of [
    undefined,
    null,
    {},
    { latitude: "6.3", longitude: 5.6 },
    { latitude: 6.3, longitude: "5.6" },
    { latitude: NaN, longitude: 5.6 },
    { latitude: 6.3, longitude: Infinity },
    { latitude: 90.1, longitude: 5.6 },
    { latitude: -90.1, longitude: 5.6 },
    { latitude: 6.3, longitude: 180.1 },
    { latitude: 6.3, longitude: -180.1 },
  ])
    assert.throws(() => reverseGeocode(coordinates), { status: 400 });
  assert.equal(fetch.mock.callCount(), 0);
});

test("missing or blank configuration fails without calling Geoapify", async (t) => {
  const fetch = mockResponse(t, []);
  for (const key of [undefined, "   "]) {
    if (key === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = key;
    await assert.rejects(searchAddresses("Test Street"), { status: 503 });
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("upstream credential, rate-limit and server failures become safe unavailable errors", async (t) => {
  for (const status of [401, 403, 429, 500]) {
    mockResponse(t, [], status);
    await assert.rejects(searchAddresses("Test Street"), {
      status: 503,
      message: "Location lookup is temporarily unavailable",
    });
  }
});

test("invalid JSON and malformed provider coordinates are rejected", async (t) => {
  for (const payload of [
    null,
    {},
    { results: {} },
    { results: [{}] },
    { results: [{ ...address, lon: 200 }] },
    { results: [{ ...address, lat: "6.3" }] },
    { results: [{ ...address, lat: null }] },
    { results: [{ ...address, formatted: "" }] },
  ]) {
    t.mock.method(global, "fetch", async () => Response.json(payload));
    await assert.rejects(searchAddresses("Test Street"), { status: 503 });
  }
  t.mock.method(global, "fetch", async () => new Response("invalid JSON"));
  await assert.rejects(searchAddresses("Test Street"), { status: 503 });
});

test("network error contents cannot expose credentials or address text", async (t) => {
  t.mock.method(global, "fetch", async () => {
    throw new Error(
      "https://provider.test/?apiKey=synthetic-test-key&text=private-address",
    );
  });
  await assert.rejects(searchAddresses("Test Street"), (error) => {
    assert.equal(error.status, 503);
    assert.ok(!error.stack.includes("synthetic-test-key"));
    assert.ok(!error.stack.includes("private-address"));
    assert.equal(error.cause, undefined);
    return true;
  });
});

test("lookup requests have an eight-second timeout and report timeout failures safely", async (t) => {
  t.mock.method(AbortSignal, "timeout", (milliseconds) => {
    assert.equal(milliseconds, 8000);
    return AbortSignal.abort(new DOMException("Timed out", "TimeoutError"));
  });
  t.mock.method(global, "fetch", async (_url, options) => {
    options.signal.throwIfAborted();
  });
  await assert.rejects(reverseGeocode({ latitude: 6.3, longitude: 5.6 }), {
    status: 503,
    message: "Location lookup is temporarily unavailable",
  });
});
