const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const ts = require("typescript");

// Test our plain TypeScript functions with the already installed compiler.
require.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const {
  discoverFeatures,
  getDailyDiscoverFeature,
  millisecondsUntilNextFoodDay,
} = require("../src/data/discover-features.ts");
const { matchDetectedLocation } = require("../src/lib/reverse-location.ts");
const { lookupDeviceLocation } = require("../src/sevices/location.service.ts");

const benin = {
  countryCode: "NG",
  principalSubdivision: "Edo State",
  principalSubdivisionCode: "NG-ED",
  city: "Benin City",
  locality: "GRA",
  lookupSource: "coordinates",
  localityInfo: {
    administrative: [
      { name: "Nigeria", adminLevel: 2 },
      { name: "Edo State", adminLevel: 4 },
      { name: "Oredo Local Government Area", adminLevel: 6 },
    ],
  },
};
const devicePosition = {
  coords: { latitude: 6.34, longitude: 5.62, accuracy: 25 },
};

// Every network response below is mocked. Never send fixture coordinates to the free API.
test("a successful location lookup replaces an old city's fields with canonical Benin labels", () => {
  assert.deepEqual(matchDetectedLocation(benin), {
    country: "Nigeria",
    state: "Edo",
    city: "Benin City",
    lga: "Oredo",
    area: "GRA",
  });
  assert.equal(
    matchDetectedLocation({
      ...benin,
      city: "Benin",
      principalSubdivisionCode: undefined,
    }).city,
    "Benin City",
  );
});

test("missing city/LGA coverage leaves fields blank instead of retaining Lagos or guessing", () => {
  const result = matchDetectedLocation({
    ...benin,
    city: "Unlisted town",
    locality: "Unlisted neighbourhood",
    localityInfo: { administrative: [] },
  });
  assert.equal(result.state, "Edo");
  assert.equal(result.city, "");
  assert.equal(result.lga, "");
  assert.equal(result.area, "Unlisted neighbourhood");
  assert.equal(
    matchDetectedLocation({ ...benin, locality: "Benin City" }).area,
    "",
  );
});

test("LGA matching tolerates punctuation and council suffixes without using city names", () => {
  const fct = matchDetectedLocation({
    countryCode: "NG",
    principalSubdivision: "FCT",
    city: "Abuja",
    locality: "Abuja",
    lookupSource: "reverseGeocoding",
    localityInfo: {
      administrative: [{ name: "Abuja Municipal Area Council", adminLevel: 6 }],
    },
  });
  assert.equal(fct.state, "Federal Capital Territory");
  assert.equal(fct.lga, "Abuja Municipal");
  const lagos = {
    countryCode: "NG",
    principalSubdivisionCode: "NG-LA",
    city: "Ikeja",
    lookupSource: "coordinates",
  };
  assert.equal(matchDetectedLocation(lagos).lga, "");
  assert.equal(
    matchDetectedLocation({
      ...lagos,
      localityInfo: {
        administrative: [{ name: "Ibeju-Lekki", adminLevel: 6 }],
      },
    }).lga,
    "Ibeju/Lekki",
  );
  assert.equal(
    matchDetectedLocation({
      ...lagos,
      localityInfo: { administrative: [{ name: "Ikeja", adminLevel: 8 }] },
    }).lga,
    "",
  );
});

test("ambiguous LGAs require confirmation, and foreign or IP-only results cannot fill a live location", () => {
  const ambiguous = {
    ...benin,
    localityInfo: {
      administrative: [
        { name: "Oredo", adminLevel: 6 },
        { name: "Egor", adminLevel: 6 },
      ],
    },
  };
  assert.equal(matchDetectedLocation(ambiguous).lga, "");
  assert.throws(
    () => matchDetectedLocation({ ...benin, countryCode: "GH" }),
    /Nigeria/,
  );
  assert.throws(
    () => matchDetectedLocation({ ...benin, lookupSource: "ipGeolocation" }),
    /confirm/,
  );
  assert.throws(
    () =>
      matchDetectedLocation({
        ...benin,
        principalSubdivisionCode: "NG-XX",
        principalSubdivision: "Unknown",
      }),
    /match the state/,
  );
});

test("device lookup requests coordinates directly without credentials or an IP fallback", async (t) => {
  const controller = new AbortController();
  let calls = 0;
  t.mock.method(global, "fetch", async (url, options) => {
    calls++;
    const request = new URL(url);
    assert.equal(request.origin, "https://api.bigdatacloud.net");
    assert.equal(request.searchParams.get("latitude"), "6.34");
    assert.equal(request.searchParams.get("longitude"), "5.62");
    assert.equal(options.signal, controller.signal);
    assert.equal(options.credentials, "omit");
    assert.equal(options.cache, "no-store");
    return { ok: true, json: async () => benin };
  });
  assert.equal(
    (await lookupDeviceLocation(devicePosition, controller.signal)).city,
    "Benin City",
  );
  assert.equal(calls, 1);
});

test("unusable device coordinates never leave the browser", async (t) => {
  let calls = 0;
  t.mock.method(global, "fetch", async () => {
    calls++;
    throw new Error("must not be called");
  });
  for (const coords of [
    { latitude: 91, longitude: 5, accuracy: 20 },
    { latitude: 6, longitude: 181, accuracy: 20 },
    { latitude: 6, longitude: 5, accuracy: 6000 },
    { latitude: 6, longitude: 5, accuracy: NaN },
  ]) {
    await assert.rejects(
      lookupDeviceLocation({ coords }, new AbortController().signal),
      /too approximate/,
    );
  }
  assert.equal(calls, 0);
});

test("network, provider and malformed-response failures offer manual entry", async (t) => {
  const fetchMock = t.mock.method(global, "fetch", async () => {
    throw new TypeError("Failed to fetch");
  });
  const signal = new AbortController().signal;
  await assert.rejects(
    lookupDeviceLocation(devicePosition, signal),
    /choose your area manually/,
  );
  fetchMock.mock.mockImplementation(async () => ({ ok: false, status: 402 }));
  await assert.rejects(
    lookupDeviceLocation(devicePosition, signal),
    /choose it manually/,
  );
  fetchMock.mock.mockImplementation(async () => ({
    ok: true,
    json: async () => ({ countryCode: 123 }),
  }));
  await assert.rejects(
    lookupDeviceLocation(devicePosition, signal),
    /choose your area manually/,
  );
  fetchMock.mock.mockImplementation(async () => ({
    ok: true,
    json: async () => {
      throw new Error("Invalid JSON");
    },
  }));
  await assert.rejects(
    lookupDeviceLocation(devicePosition, signal),
    /choose your area manually/,
  );
});

test("the food banner changes at midnight in Nigeria, rather than UTC or the device's timezone", () => {
  assert.equal(
    getDailyDiscoverFeature(new Date("2026-10-23T22:59:59.999Z")),
    discoverFeatures[0],
  );
  assert.equal(
    getDailyDiscoverFeature(new Date("2026-10-23T23:00:00.000Z")),
    discoverFeatures[1],
  );
  assert.equal(
    millisecondsUntilNextFoodDay(new Date("2026-10-23T22:59:59.999Z")),
    1,
  );
  assert.equal(
    millisecondsUntilNextFoodDay(new Date("2026-10-23T23:00:00Z")),
    86400000,
  );
});

test("the daily rotation wraps and supports edits to its list length", () => {
  const dateAfterDays = (days) => new Date(Date.UTC(2026, 9, 23 + days, 10));
  const length = discoverFeatures.length;
  assert.equal(
    getDailyDiscoverFeature(dateAfterDays(length)),
    discoverFeatures[0],
  );
  assert.equal(
    getDailyDiscoverFeature(dateAfterDays(-1)),
    discoverFeatures.at(-1),
  );
  const extra = { ...discoverFeatures[0], title: "Another meal" };
  discoverFeatures.push(extra);
  try {
    assert.equal(getDailyDiscoverFeature(dateAfterDays(length)), extra);
    assert.equal(
      getDailyDiscoverFeature(dateAfterDays(length + 1)),
      discoverFeatures[0],
    );
  } finally {
    discoverFeatures.pop();
  }
});

test("daily copy stays paired with its dish, with balanced languages and sharp source images", () => {
  const { dishes, getDish } = require("../src/data/food-inspiration.ts");
  assert.equal(
    discoverFeatures.filter((entry) => entry.language === "en").length,
    discoverFeatures.filter((entry) => entry.language === "pcm").length,
  );
  assert.equal(
    new Set(discoverFeatures.map((entry) => entry.dish.id)).size,
    discoverFeatures.length,
  );
  for (const feature of discoverFeatures) {
    assert.equal(feature.dish, getDish(feature.dish.id));
    assert.ok(
      feature.title && feature.accent && feature.foods && feature.dish.alt,
    );
    const image = readFileSync(
      join(__dirname, "../public", feature.dish.image),
    );
    assert.equal(image.subarray(1, 4).toString(), "PNG");
    assert.ok(
      image.readUInt32BE(16) >= 1200,
      `${feature.dish.id} must have a sharp source image`,
    );
    assert.ok(image.readUInt32BE(20) >= 1200);
  }
  for (const id of ["banga-and-starch", "groundnut-and-eba"])
    assert.equal(getDish(id).category, "Soups & swallows");
  assert.equal(new Set(dishes.map((dish) => dish.id)).size, dishes.length);
  assert.throws(() => getDish("missing-dish"), /Unknown dish/);
});
