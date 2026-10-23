const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createHash } = require("node:crypto");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const { startTestDatabase } = require("./support/database.cjs");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "isolated-auth-test-secret";
process.env.CLIENT_URL = "https://foodie.example";
process.env.SMTP_HOST = "smtp.example.test";
process.env.SMTP_USER = "test-user";
process.env.SMTP_PASSWORD = "test-password";
process.env.MAIL_FROM = "Foodie <hello@example.test>";

const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");
const { UserModel } = require("../src/domain/user.model");
const { nigeria } = require("../src/location/location.catalogue");
const { locationSchema } = require("../src/auth/auth.validation");
const {
  deliverPasswordReset,
} = require("../src/auth/password-reset/passwordReset.service");

test("canonical Nigerian location choices", () => {
  assert.equal(nigeria.states.length, 37);
  assert.equal(new Set(nigeria.states.map((state) => state.code)).size, 37);
  for (const state of nigeria.states) {
    assert.ok(state.cities.length);
    assert.equal(
      new Set(state.cities.map((city) => city.name)).size,
      state.cities.length,
    );
  }
  for (const [state, city, code] of [
    ["edo", "benin city", "ED"],
    ["FCT", "Abuja", "FC"],
    ["Lagos", "Ikeja", "LA"],
  ]) {
    const result = locationSchema.validate({
      country: " nigeria ",
      state,
      city,
    });
    assert.ifError(result.error);
    assert.equal(result.value.countryCode, "NG");
    assert.equal(result.value.stateCode, code);
    assert.equal(typeof result.value.cityId, "number");
  }
  for (const location of [
    { country: "Ghana", state: "Lagos", city: "Lagos" },
    { country: "Nigeria", state: "Lagos", city: "Benin City" },
    { country: "Nigeria", state: "Edo", city: "Benin City", stateCode: "LA" },
    { country: "Nigeria", state: "Edo", city: "Benin City", cityId: 1 },
  ])
    assert.ok(locationSchema.validate(location).error);
});

test("LGA and device position validation keeps location input consistent", () => {
  const directory = require("../../shared/data/nigeria-lgas.json");
  assert.equal(directory.states.length, 37);
  assert.equal(directory.states.flatMap((state) => state.lgas).length, 774);
  assert.equal(
    new Set(
      directory.states.flatMap((state) => state.lgas.map((lga) => lga.id)),
    ).size,
    774,
  );
  const base = {
    country: "Nigeria",
    state: "Edo",
    city: "Benin City",
    lga: " oredo ",
    area: " GRA ",
  };
  const valid = locationSchema.validate(base);
  assert.ifError(valid.error);
  assert.equal(valid.value.lga, "Oredo");
  assert.equal(valid.value.area, "GRA");
  for (const extra of [
    { lga: "Ikeja" },
    { lgaCode: "forged" },
    { area: "a".repeat(101) },
    { point: { type: "Point", coordinates: [181, 6] } },
    { point: { type: "Point", coordinates: [5, -91] } },
    { point: { type: "Point", coordinates: [5] } },
    { point: { type: "Point", coordinates: [5, 6, 7] } },
    { point: { type: "Polygon", coordinates: [5, 6] } },
    { accuracyMeters: 10 },
    { point: { type: "Point", coordinates: [5, 6] }, accuracyMeters: -1 },
  ])
    assert.ok(locationSchema.validate({ ...base, ...extra }).error);
  assert.ok(
    locationSchema.validate({
      country: "Nigeria",
      state: "Edo",
      city: "Benin City",
      lgaCode: "forged",
    }).error,
  );
});

test(
  "password recovery with isolated MongoDB and captured SMTP",
  { timeout: 60000 },
  async (t) => {
    const messages = [];
    let failMail = false;
    t.mock.method(nodemailer, "createTransport", (options) => {
      assert.equal(options.secure, false);
      assert.equal(options.requireTLS, true);
      return {
        sendMail: async (message) => {
          if (failMail) throw new Error("Simulated SMTP failure");
          messages.push(message);
          return { messageId: "captured-test-email" };
        },
      };
    });
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
    async function request(path, body, headers = {}) {
      const result = await fetch(`${base}${path}`, {
        method: body ? "POST" : "GET",
        headers: { "Content-Type": "application/json", ...headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      return {
        status: result.status,
        body: await result.json(),
        cookie: result.headers.get("set-cookie"),
      };
    }
    const email = "recovery@example.com";
    const oldPassword = "old-password";
    const newPassword = "new-password";
    const signup = await request("/auth/user-signup", {
      email,
      password: oldPassword,
      location: { country: "Nigeria", state: "Edo", city: "Benin City" },
    });
    assert.equal(signup.status, 201);
    assert.equal(signup.body.data.location.stateCode, "ED");
    const login = await request("/auth/login", {
      email,
      password: oldPassword,
    });
    assert.equal(login.status, 200);

    await t.test(
      "random hashed, hidden, expiring tokens and per-account cooldown",
      async () => {
        await deliverPasswordReset(email);
        assert.equal(messages.length, 1);
        await deliverPasswordReset(email);
        await deliverPasswordReset("unknown@example.com");
        assert.equal(messages.length, 1);
        const token = messages[0].text.match(/#[a-f0-9]{64}/)[0].slice(1);
        const user = await UserModel.findOne({ email }).select(
          "+passwordResetTokenHash +passwordResetExpiresAt",
        );
        assert.equal(
          user.passwordResetTokenHash,
          createHash("sha256").update(token).digest("hex"),
        );
        assert.notEqual(user.passwordResetTokenHash, token);
        assert.ok(user.passwordResetExpiresAt > Date.now());
        assert.ok(user.passwordResetExpiresAt <= Date.now() + 20 * 60_000);
        assert.equal(
          (await UserModel.findOne({ email })).passwordResetTokenHash,
          undefined,
        );
      },
    );

    const token = messages[0].text.match(/#[a-f0-9]{64}/)[0].slice(1);
    await t.test(
      "confirmation and password limits are enforced without consuming the token",
      async () => {
        assert.equal(
          (
            await request("/auth/reset-password", {
              token,
              password: newPassword,
              confirmPassword: "different",
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await request("/auth/reset-password", {
              token,
              password: "x".repeat(73),
              confirmPassword: "x".repeat(73),
            })
          ).status,
          400,
        );
      },
    );

    await t.test(
      "exactly one concurrent reset succeeds and previous sessions are revoked",
      async () => {
        const results = await Promise.all(
          [1, 2].map(() =>
            request("/auth/reset-password", {
              token,
              password: newPassword,
              confirmPassword: newPassword,
            }),
          ),
        );
        assert.deepEqual(
          results.map((result) => result.status).sort(),
          [200, 400],
        );
        assert.ok(
          results
            .find((result) => result.status === 200)
            .cookie.includes("refreshToken=;"),
        );
        assert.equal(
          (await request("/auth/login", { email, password: oldPassword }))
            .status,
          401,
        );
        const fresh = await request("/auth/login", {
          email,
          password: newPassword,
        });
        assert.equal(fresh.status, 200);
        assert.equal(fresh.body.data.passwordResetTokenHash, undefined);
        assert.equal(fresh.body.data.tokenVersion, undefined);
        assert.equal(
          (
            await request(`/users/${signup.body.data.userId}`, undefined, {
              Authorization: `Bearer ${login.body.data.accessToken}`,
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await request(
              "/auth/refresh-token",
              {},
              { Cookie: login.cookie.split(";")[0] },
            )
          ).status,
          401,
        );
        assert.equal(
          (
            await request(`/users/${signup.body.data.userId}`, undefined, {
              Authorization: `Bearer ${fresh.body.data.accessToken}`,
            })
          ).status,
          200,
        );
      },
    );

    await t.test(
      "expired links fail and SMTP failures clean up unsent tokens",
      async () => {
        await deliverPasswordReset(email);
        const latest = messages
          .filter((message) => message.subject === "Reset your Foodie password")
          .at(-1);
        const expired = latest.text.match(/#[a-f0-9]{64}/)[0].slice(1);
        await UserModel.updateOne(
          { email },
          {
            $set: {
              passwordResetExpiresAt: new Date(Date.now() - 1000),
              passwordResetRequestedAt: new Date(0),
            },
          },
        );
        assert.equal(
          (
            await request("/auth/reset-password", {
              token: expired,
              password: newPassword,
              confirmPassword: newPassword,
            })
          ).status,
          400,
        );
        failMail = true;
        await assert.rejects(deliverPasswordReset(email), /SMTP failure/);
        failMail = false;
        const stored = await UserModel.findOne({ email }).select(
          "+passwordResetTokenHash",
        );
        assert.equal(stored.passwordResetTokenHash, undefined);
      },
    );

    await t.test(
      "missing SMTP returns an honest unavailable state for any email",
      async () => {
        const host = process.env.SMTP_HOST;
        delete process.env.SMTP_HOST;
        const existing = await request("/auth/forgot-password", { email });
        const unknown = await request("/auth/forgot-password", {
          email: "unknown@example.com",
        });
        assert.equal(existing.status, 503);
        assert.deepEqual(existing.body, unknown.body);
        process.env.SMTP_HOST = host;
      },
    );

    await t.test(
      "accepted requests do not reveal accounts and excessive requests are limited",
      async () => {
        const existing = await request("/auth/forgot-password", { email });
        const unknown = await request("/auth/forgot-password", {
          email: "unknown@example.com",
        });
        assert.equal(existing.status, 202);
        assert.deepEqual(existing.body, unknown.body);
        let result;
        for (let attempt = 0; attempt < 12; attempt++) {
          result = await request("/auth/forgot-password", {
            email: "unknown@example.com",
          });
          if (result.status === 429) break;
        }
        assert.equal(result.status, 429);
        // Drain accepted background deliveries before the isolated database is removed.
        await new Promise((resolve) => setTimeout(resolve, 100));
      },
    );
  },
);
