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
const {
  addressFromSuggestion,
  addressFromSaved,
  confirmedAddress,
  addressDetailsSchema,
} = require("../src/lib/address.ts");
const {
  signupSchema,
  normalizePhone,
} = require("../src/lib/auth-validation.ts");

const suggestion = {
  formattedAddress: "12 Test Street, Benin City, Nigeria",
  country: "Nigeria",
  countryCode: "NG",
  state: "Edo State",
  city: "Benin",
  street: "Test Street",
  houseNumber: "12",
  point: { type: "Point", coordinates: [5.62, 6.34] },
  precision: "building",
};

test("mapped addresses populate known labels without guessing an LGA or house number", () => {
  const draft = addressFromSuggestion(suggestion);
  assert.equal(draft.state, "Edo");
  assert.equal(draft.city, "Benin City");
  assert.equal(draft.street1, "12 Test Street");
  assert.equal(draft.lga, "");
  assert.equal(
    addressFromSuggestion({ ...suggestion, houseNumber: undefined }).street1,
    "Test Street",
  );
  assert.equal(
    addressFromSuggestion({
      ...suggestion,
      state: "Lagos State",
      city: "Unlisted locality",
    }).city,
    "Unlisted locality",
  );
  assert.equal(
    addressFromSuggestion({ ...suggestion, state: "Unknown" }).state,
    "",
  );
  assert.equal(addressFromSuggestion(null).street1, "");
});

test("confirmation sends reviewed fields without stale IDs, display labels or GPS accuracy on search pins", () => {
  const draft = addressFromSaved({
    country: "Nigeria",
    state: "Edo",
    city: "Benin City",
    street1: "12 Test Street",
    street2: "Flat 2",
    zip: "300001",
    cityId: 123,
    confirmedAt: "2020-01-01",
    formattedAddress: "Old display",
    point: suggestion.point,
    pointSource: "search",
    accuracyMeters: 100,
  });
  const parsed = addressDetailsSchema.parse({
    ...draft,
    city: "Unlisted locality",
    street2: "",
  });
  const result = confirmedAddress(parsed, draft);
  assert.equal(result.city, "Unlisted locality");
  assert.equal(result.street2, undefined);
  assert.equal(result.zip, "300001");
  for (const field of [
    "accuracyMeters",
    "confirmedAt",
    "formattedAddress",
    "cityId",
  ])
    assert.equal(result[field], undefined);
  assert.deepEqual(result.point, suggestion.point);
  assert.throws(
    () => confirmedAddress(parsed, { ...draft, point: undefined }),
    /map first/,
  );
  const device = confirmedAddress(parsed, {
    ...draft,
    pointSource: "device",
    accuracyMeters: 25,
  });
  assert.equal(device.accuracyMeters, 25);
});

test("review requires useful address details but not an LGA or postcode", () => {
  const draft = addressFromSuggestion(suggestion);
  assert.equal(addressDetailsSchema.safeParse(draft).success, true);
  assert.equal(
    addressDetailsSchema.safeParse({ ...draft, street1: "" }).success,
    false,
  );
  assert.equal(
    addressDetailsSchema.safeParse({ ...draft, state: "Unknown" }).success,
    false,
  );
  assert.equal(
    addressDetailsSchema.safeParse({ ...draft, lga: "Ikeja" }).success,
    false,
  );
});

test("signup validates account details without requiring location dropdowns", () => {
  const account = {
    username: "Foodie",
    email: "test@example.com",
    phoneNumber: "08012345678",
    password: "secret-password",
    confirmPassword: "secret-password",
  };
  assert.equal(signupSchema.safeParse(account).success, true);
  assert.equal(
    signupSchema.safeParse({ ...account, confirmPassword: "wrong" }).success,
    false,
  );
  assert.equal(
    signupSchema.safeParse({ ...account, phoneNumber: "123" }).success,
    false,
  );
});

test("phone numbers use one international format and reject incomplete or malformed input", () => {
  for (const [input, expected] of [
    ["0801 234 5678", "+2348012345678"],
    ["2348012345678", "+2348012345678"],
    ["+234 801 234 5678", "+2348012345678"],
    ["+44 20 7946 0018", "+442079460018"],
    ["+1 (213) 373-4253", "+12133734253"],
  ])
    assert.equal(normalizePhone(input), expected);
  for (const input of [
    "",
    "+234",
    "123",
    "+2341234567890",
    "+99912345678",
    "Call +2348012345678",
    "+2348012345678 ext. 2",
  ])
    assert.equal(normalizePhone(input), undefined, input);
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
