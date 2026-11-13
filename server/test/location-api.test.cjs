const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const mongoose = require("mongoose");
const { MemoryStore } = require("express-rate-limit");
const { startTestDatabase } = require("./support/database.cjs");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "isolated-location-api-test-secret";
process.env.GEOAPIFY_API_KEY = "synthetic-location-api-key";
const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");
const { UserModel } = require("../src/domain/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../src/utils/jwt");
const httpFetch = global.fetch;

const providerAddress = {
  formatted: "12 Test Street, Benin City, Nigeria",
  country_code: "ng",
  state: "Edo",
  city: "Benin City",
  street: "Test Street",
  housenumber: "12",
  lon: 5.6,
  lat: 6.3,
  result_type: "building",
  distance: 25,
};

test("authenticated location lookup API", { timeout: 60000 }, async (t) => {
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
  const base = `http://127.0.0.1:${server.address().port}/api/v1/locations`;

  let providerCalls = 0;
  let providerResults = [providerAddress];
  let providerStatus = 200;
  let providerFailure = false;
  t.mock.method(global, "fetch", async (url) => {
    if (new URL(url).origin === "https://maps.geoapify.com")
      return new Response(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), {
        headers: { "Content-Type": "image/png" },
      });
    assert.equal(new URL(url).origin, "https://api.geoapify.com");
    providerCalls++;
    if (providerFailure)
      throw new Error(
        "provider URL with synthetic-location-api-key and private-input",
      );
    return Response.json(
      { results: providerResults },
      { status: providerStatus },
    );
  });

  async function account(name, extra = {}) {
    const user = await UserModel.create({
      email: `${name}@example.test`,
      passwordHash: "not-a-real-password",
      ...extra,
    });
    const identity = {
      userId: user.id,
      role: "user",
      roles: ["user"],
      tokenVersion: 0,
    };
    return { user, identity, token: generateAccessToken(identity) };
  }
  const customer = await account("location-customer", {
    location: { country: "Nigeria", state: "Lagos", city: "Ikeja" },
  });

  async function request(path, body, token = customer.token, extra = {}) {
    const result = await httpFetch(base + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      ...extra,
    });
    assert.equal(result.headers.get("cache-control"), "no-store");
    return {
      status: result.status,
      headers: result.headers,
      body: await result.json(),
    };
  }

  await t.test(
    "both endpoints require a valid active session before provider access",
    async () => {
      const before = providerCalls;
      for (const token of [
        null,
        "invalid",
        generateRefreshToken(customer.identity),
      ]) {
        for (const path of ["/search", "/reverse"])
          assert.equal((await request(path, {}, token)).status, 401);
      }
      const inactive = await account("inactive-location", { isActive: false });
      const revoked = await account("revoked-location", { tokenVersion: 1 });
      for (const { token } of [inactive, revoked])
        assert.equal(
          (await request("/search", { text: "Test Street" }, token)).status,
          401,
        );
      assert.equal(providerCalls, before);
    },
  );

  await t.test(
    "search and reverse return normalized suggestions with attribution",
    async () => {
      const search = await request("/search", { text: "  Test Street  " });
      assert.equal(search.status, 200);
      assert.equal(search.body.success, true);
      assert.equal(search.body.data.suggestions.length, 1);
      assert.equal(search.body.data.suggestions[0].houseNumber, "12");
      assert.ok(search.body.data.attribution.text.includes("Geoapify"));
      assert.ok(
        !JSON.stringify(search.body).includes("synthetic-location-api-key"),
      );

      const reverse = await request("/reverse", {
        latitude: 6.31,
        longitude: 5.61,
      });
      assert.equal(reverse.status, 200);
      assert.deepEqual(reverse.body.data.address.point.coordinates, [5.6, 6.3]);
      assert.equal(reverse.body.data.address.distanceMeters, 25);
      assert.equal(reverse.body.data.address.accuracyMeters, undefined);
      assert.deepEqual(
        reverse.body.data.attribution,
        search.body.data.attribution,
      );
    },
  );

  await t.test(
    "missing and foreign matches return a usable empty state",
    async () => {
      for (const results of [
        [],
        [{ ...providerAddress, country_code: "gh" }],
      ]) {
        providerResults = results;
        const search = await request("/search", { text: "Unlisted street" });
        assert.equal(search.status, 200);
        assert.deepEqual(search.body.data.suggestions, []);
        const reverse = await request("/reverse", {
          latitude: 6.3,
          longitude: 5.6,
        });
        assert.equal(reverse.status, 200);
        assert.equal(reverse.body.data.address, null);
      }
      providerResults = [providerAddress];
    },
  );

  await t.test(
    "invalid bodies and query parameters never reach the provider",
    async () => {
      const validationCustomer = await account("validation-location");
      const before = providerCalls;
      for (const body of [
        undefined,
        null,
        [],
        {},
        { text: "ab" },
        { text: 123 },
        { text: ["Test Street"] },
        { text: "x".repeat(201) },
        { text: "Test Street", userId: customer.user.id },
      ])
        assert.equal(
          (await request("/search", body, validationCustomer.token)).status,
          400,
        );
      for (const body of [
        {},
        { latitude: 6.3 },
        { latitude: "6.3", longitude: 5.6 },
        { latitude: 6.3, longitude: "5.6" },
        { latitude: null, longitude: 5.6 },
        { latitude: 91, longitude: 5.6 },
        { latitude: 6.3, longitude: -181 },
        { latitude: 6.3, longitude: 5.6, userId: customer.user.id },
      ])
        assert.equal(
          (await request("/reverse", body, validationCustomer.token)).status,
          400,
        );
      assert.equal(
        (
          await request(
            "/search?text=private-input",
            { text: "Test Street" },
            validationCustomer.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (await request("/reverse", {}, validationCustomer.token, { body: "{" }))
          .status,
        400,
      );
      assert.equal(providerCalls, before);
    },
  );

  await t.test(
    "provider and configuration failures use the existing safe error response",
    async () => {
      for (const status of [401, 429, 500]) {
        providerStatus = status;
        const result = await request("/search", { text: "Test Street" });
        assert.equal(result.status, 503);
        assert.deepEqual(result.body, {
          success: false,
          message: "Service temporarily unavailable. Please try again later",
          data: null,
        });
      }
      providerStatus = 200;
      providerFailure = true;
      const networkError = await request("/reverse", {
        latitude: 6.3,
        longitude: 5.6,
      });
      assert.equal(networkError.status, 503);
      assert.ok(!JSON.stringify(networkError.body).includes("private-input"));
      providerFailure = false;
      const key = process.env.GEOAPIFY_API_KEY;
      delete process.env.GEOAPIFY_API_KEY;
      try {
        const before = providerCalls;
        assert.equal(
          (await request("/search", { text: "Test Street" })).status,
          503,
        );
        assert.equal(providerCalls, before);
      } finally {
        process.env.GEOAPIFY_API_KEY = key;
      }
    },
  );

  await t.test(
    "search and reverse share an account limit without blocking another customer",
    async () => {
      const limited = await account("limited-location");
      const other = await account("other-location");
      const before = providerCalls;
      for (let index = 0; index < 30; index++) {
        const path = index % 2 ? "/reverse" : "/search";
        const body =
          index % 2
            ? { latitude: 6.3, longitude: 5.6 }
            : { text: "Test Street" };
        assert.equal((await request(path, body, limited.token)).status, 200);
      }
      const blocked = await request(
        "/search",
        { text: "Test Street" },
        limited.token,
      );
      assert.equal(blocked.status, 429);
      assert.ok(Number(blocked.headers.get("retry-after")) > 0);
      assert.equal(providerCalls, before + 30);
      assert.equal(
        (await request("/search", { text: "Test Street" }, other.token)).status,
        200,
      );
    },
  );

  await t.test(
    "exhausted process allowance blocks both endpoints and all accounts",
    async (subtest) => {
      const increment = MemoryStore.prototype.increment;
      subtest.mock.method(
        MemoryStore.prototype,
        "increment",
        async function (key) {
          if (key === "location-lookups")
            return {
              totalHits: 2501,
              resetTime: new Date(Date.now() + 60_000),
            };
          return increment.call(this, key);
        },
      );
      const other = await account("daily-limit-location");
      const before = providerCalls;
      assert.equal(
        (await request("/search", { text: "Test Street" })).status,
        429,
      );
      assert.equal(
        (
          await request(
            "/reverse",
            { latitude: 6.3, longitude: 5.6 },
            other.token,
          )
        ).status,
        429,
      );
      assert.equal(providerCalls, before);
    },
  );

  await t.test(
    "lookup does not replace the customer's saved destination",
    async () => {
      const result = await request("/reverse", {
        latitude: 6.3,
        longitude: 5.6,
      });
      assert.equal(result.status, 200);
      const saved = await UserModel.findById(customer.user.id).lean();
      assert.equal(saved.location.state, "Lagos");
      assert.equal(saved.location.city, "Ikeja");
      assert.equal(saved.location.point, undefined);
    },
  );

  await t.test(
    "map tiles require authentication and return images without exposing the provider key",
    async () => {
      const path = base + "/tiles/3/2/2";
      assert.equal((await httpFetch(path)).status, 401);
      const result = await httpFetch(path, {
        headers: { Authorization: `Bearer ${customer.token}` },
      });
      assert.equal(result.status, 200);
      assert.ok(result.headers.get("content-type").startsWith("image/png"));
      assert.equal(result.headers.get("cache-control"), "no-store");
      assert.deepEqual(
        Buffer.from(await result.arrayBuffer()),
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      );
      assert.equal(
        (
          await httpFetch(base + "/tiles/20/0/0", {
            headers: { Authorization: `Bearer ${customer.token}` },
          })
        ).status,
        400,
      );
    },
  );

  await t.test(
    "request logs omit address text, coordinates and query strings",
    async (subtest) => {
      let loggingServer;
      let output = "";
      const previousEnvironment = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      try {
        loggingServer = createApp().listen(0, "127.0.0.1");
        await once(loggingServer, "listening");
        const write = process.stdout.write;
        subtest.mock.method(
          process.stdout,
          "write",
          function (chunk, encoding, callback) {
            // Preserve the test runner's own output and child-process messages.
            if (
              typeof chunk !== "string" ||
              !chunk.includes("/api/v1/locations")
            )
              return write.call(this, chunk, encoding, callback);
            output += chunk;
            if (typeof encoding === "function") encoding();
            else if (typeof callback === "function") callback();
            return true;
          },
        );
        const result = await httpFetch(
          `http://127.0.0.1:${loggingServer.address().port}/api/v1/locations/search?text=private-address&latitude=6.123456`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${customer.token}`,
            },
            body: JSON.stringify({ text: "private-body-address" }),
          },
        );
        await result.text();
        assert.equal(result.status, 400);
        assert.ok(output.includes("POST /api/v1/locations 400"));
        for (const secret of [
          "private-address",
          "6.123456",
          "private-body-address",
          customer.token,
        ])
          assert.ok(!output.includes(secret));
      } finally {
        subtest.mock.restoreAll();
        process.env.NODE_ENV = previousEnvironment;
        if (loggingServer) {
          loggingServer.closeAllConnections();
          await new Promise((resolve) => loggingServer.close(resolve));
        }
      }
    },
  );
});
