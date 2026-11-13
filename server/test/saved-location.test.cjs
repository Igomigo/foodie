const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const mongoose = require("mongoose");
const { startTestDatabase } = require("./support/database.cjs");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "isolated-saved-location-test-secret";
const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");
const { UserModel } = require("../src/domain/user.model");
const { generateAccessToken } = require("../src/utils/jwt");
const {
  nigeria,
  findNigerianState,
} = require("../src/location/location.catalogue");
const { preserveAddressDetails } = require("../src/location/saved-location");

const address = {
  country: "Nigeria",
  state: "Edo State",
  city: "Benin",
  lga: "oredo",
  area: "GRA",
  street1: " 12 Test Street ",
  street2: "Flat 2",
  zip: "300001",
  point: { type: "Point", coordinates: [5.62, 6.34] },
  pointSource: "device",
  accuracyMeters: 25,
};

test("confirmed state matching accepts canonical names, codes and provider state suffixes", () => {
  for (const state of nigeria.states) {
    assert.equal(findNigerianState(state.name)?.code, state.code);
    assert.equal(findNigerianState(`NG-${state.code}`)?.code, state.code);
    if (state.code !== "FC")
      assert.equal(findNigerianState(`${state.name} State`)?.code, state.code);
  }
  assert.equal(findNigerianState("FCT")?.code, "FC");
  assert.equal(findNigerianState("Unknown State"), undefined);
});

test("legacy edits never retain old address details for a changed destination", () => {
  const previous = {
    ...address,
    country: "Nigeria",
    state: "Edo",
    city: "Benin City",
    lga: "Oredo",
    formattedAddress: "Previous address",
    confirmedAt: new Date(),
  };
  const next = {
    country: "Nigeria",
    state: "Edo",
    city: "Benin City",
    lga: "Oredo",
    area: "GRA",
    point: address.point,
    accuracyMeters: 25,
  };
  assert.equal(preserveAddressDetails(previous, next).street1, address.street1);
  for (const changes of [
    { state: "Lagos" },
    { city: "Another town" },
    { lga: "Egor" },
    { area: "Another area" },
    { point: undefined },
    { point: { type: "Point", coordinates: [5.63, 6.34] } },
    { street1: "Another street" },
    { accuracyMeters: 30 },
  ]) {
    const result = preserveAddressDetails(previous, { ...next, ...changes });
    assert.equal(result.formattedAddress, undefined);
    assert.equal(result.confirmedAt, undefined);
    assert.equal(result.pointSource, undefined);
  }
});

test("customer-confirmed address saving", { timeout: 60000 }, async (t) => {
  const database = await startTestDatabase();
  let server;
  t.after(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState === 1)
      await mongoose.connection.dropDatabase();
    await disconnectDatabase();
    await database.stop();
  });
  process.env.MONGODB_URI = database.uri;
  await connectDatabase();
  server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const customer = await UserModel.create({
    email: "address@example.test",
    passwordHash: "not-a-real-password",
  });
  const other = await UserModel.create({
    email: "other-address@example.test",
    passwordHash: "not-a-real-password",
  });
  const token = generateAccessToken({
    userId: customer.id,
    role: "user",
    roles: ["user"],
  });
  async function save(
    location,
    extra = { confirmed: true },
    accessToken = token,
  ) {
    const result = await fetch(`${base}/users/me/location`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ ...extra, location }),
    });
    assert.equal(result.headers.get("cache-control"), "no-store");
    return { status: result.status, body: await result.json() };
  }
  async function profile() {
    const result = await fetch(`${base}/users/${customer.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(result.headers.get("cache-control"), "no-store");
    return (await result.json()).data;
  }

  await t.test(
    "confirmation saves full address parts, canonical codes and server-owned metadata",
    async () => {
      const before = Date.now();
      const result = await save(address, {
        confirmed: true,
        userId: other.id,
        roles: ["admin"],
      });
      assert.equal(result.status, 200);
      const saved = result.body.data.location;
      assert.equal(saved.state, "Edo");
      assert.equal(saved.stateCode, "ED");
      assert.equal(saved.city, "Benin City");
      assert.equal(typeof saved.cityId, "number");
      assert.equal(saved.lga, "Oredo");
      assert.ok(saved.lgaCode);
      assert.equal(saved.street1, "12 Test Street");
      assert.equal(saved.street2, "Flat 2");
      assert.equal(saved.zip, "300001");
      assert.equal(
        saved.formattedAddress,
        "12 Test Street, Flat 2, GRA, Benin City, Edo, 300001, Nigeria",
      );
      assert.deepEqual(saved.point.coordinates, [5.62, 6.34]);
      assert.equal(saved.pointSource, "device");
      assert.equal(saved.accuracyMeters, 25);
      assert.ok(Date.parse(saved.confirmedAt) >= before);
      assert.ok(Date.parse(saved.confirmedAt) <= Date.now());
      assert.equal(result.body.data.userId, customer.id);
      assert.deepEqual(result.body.data.roles, ["user"]);
      assert.equal(result.body.data.passwordHash, undefined);
      assert.equal((await UserModel.findById(other.id)).location, undefined);
      assert.deepEqual((await profile()).location, saved);
    },
  );

  await t.test(
    "an unchanged save from the existing manual form keeps the full address",
    async () => {
      const current = (await profile()).location;
      const result = await save(
        {
          country: current.country,
          state: current.state,
          city: current.city,
          lga: current.lga,
          area: current.area,
          point: current.point,
          accuracyMeters: current.accuracyMeters,
        },
        {},
      );
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.data.location, current);
    },
  );

  await t.test(
    "unsupported city labels can be saved with a confirmed pin without inventing codes",
    async () => {
      const result = await save({
        country: "NG",
        state: "Lagos State",
        city: "Customer-entered locality",
        street1: "Beside the test landmark",
        point: address.point,
        pointSource: "pin",
      });
      assert.equal(result.status, 200);
      const saved = result.body.data.location;
      assert.equal(saved.stateCode, "LA");
      assert.equal(saved.city, "Customer-entered locality");
      assert.equal(saved.cityId, undefined);
      assert.equal(saved.lga, undefined);
      assert.equal(saved.lgaCode, undefined);
      assert.equal(saved.street2, undefined);
      assert.equal(saved.zip, undefined);
      assert.equal(saved.area, undefined);
      assert.equal(saved.accuracyMeters, undefined);
    },
  );

  await t.test(
    "invalid confirmations do not overwrite the saved destination",
    async () => {
      const before = (await profile()).location;
      for (const changes of [
        { country: "Ghana" },
        { state: "Unknown State" },
        { stateCode: "LA" },
        { cityId: 1 },
        { lga: "Ikeja" },
        { lgaCode: "forged" },
        { street1: undefined },
        { street1: " " },
        { street1: "x".repeat(201) },
        { street2: "x".repeat(201) },
        { zip: "x".repeat(21) },
        { point: undefined },
        { point: { type: "Point", coordinates: [181, 6] } },
        { point: { type: "Point", coordinates: ["5.62", 6.34] } },
        { point: { type: "Point", coordinates: [5.62, 6.34, 1] } },
        { pointSource: undefined },
        { pointSource: "provider-verified" },
        { accuracyMeters: undefined },
        { accuracyMeters: -1 },
        { accuracyMeters: 5001 },
        { pointSource: "search" },
        { pointSource: "pin" },
        { confirmedAt: "2020-01-01T00:00:00.000Z" },
        { formattedAddress: "Forged address" },
      ])
        assert.equal(
          (await save({ ...address, ...changes })).status,
          400,
          JSON.stringify(changes),
        );
      assert.equal((await save(address, { confirmed: "true" })).status, 400);
      assert.equal((await save(address, { confirmed: false })).status, 400);
      assert.equal(
        (await save({ ...address, city: "Unlisted town" }, {})).status,
        400,
      );
      assert.deepEqual((await profile()).location, before);
    },
  );

  await t.test(
    "search results and edited pins do not retain old device accuracy or unit details",
    async () => {
      const result = await save({
        country: "Nigeria",
        state: "FCT",
        city: "Abuja",
        street1: "20 Test Road",
        point: { type: "Point", coordinates: [7.48, 9.08] },
        pointSource: "search",
      });
      assert.equal(result.status, 200);
      const saved = result.body.data.location;
      assert.equal(saved.stateCode, "FC");
      assert.equal(saved.city, "Abuja");
      assert.equal(saved.pointSource, "search");
      assert.equal(saved.accuracyMeters, undefined);
      assert.equal(saved.street2, undefined);
      assert.equal(
        saved.formattedAddress,
        "20 Test Road, Abuja, Federal Capital Territory, Nigeria",
      );
      const changed = await save({
        ...address,
        street1: "15 Another Street",
        street2: undefined,
        zip: undefined,
      });
      assert.equal(changed.status, 200);
      assert.equal(changed.body.data.location.street2, undefined);
      assert.equal(changed.body.data.location.zip, undefined);
      assert.ok(
        changed.body.data.location.formattedAddress.startsWith(
          "15 Another Street, GRA",
        ),
      );
    },
  );

  await t.test(
    "manual region changes clear the old address, coordinates and confirmation",
    async () => {
      const result = await save(
        { country: "Nigeria", state: "Lagos", city: "Ikeja", lga: "Ikeja" },
        {},
      );
      assert.equal(result.status, 200);
      for (const field of [
        "street1",
        "street2",
        "zip",
        "point",
        "pointSource",
        "accuracyMeters",
        "confirmedAt",
        "formattedAddress",
      ])
        assert.equal(result.body.data.location[field], undefined);
      assert.equal(result.body.data.location.city, "Ikeja");
    },
  );

  await t.test(
    "confirmation is explicit and requires an authenticated account",
    async () => {
      const legacy = { ...address, state: "Edo", city: "Benin City" };
      const result = await save(legacy, {});
      assert.equal(result.status, 200);
      assert.equal(result.body.data.location.street1, "12 Test Street");
      assert.equal(result.body.data.location.confirmedAt, undefined);
      assert.equal(result.body.data.location.pointSource, undefined);
      const before = (await profile()).location;
      assert.equal(
        (await save(address, { confirmed: true }, null)).status,
        401,
      );
      assert.deepEqual((await profile()).location, before);
    },
  );
});
