const { test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { startTestDatabase } = require("./support/database.cjs");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET_KEY = "isolated-deployment-test-secret";
process.env.CLIENT_URL = "https://foodie.example.com";
process.env.TRUST_PROXY_HOPS = "1";
for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "MAIL_FROM"])
  process.env[key] = "";

const { createApp } = require("../src/app");
const { connectDatabase, disconnectDatabase } = require("../src/config/mongo");

test(
  "deployment readiness and hosted requests",
  { timeout: 60000 },
  async (t) => {
    const database = await startTestDatabase();
    process.env.MONGODB_URI = database.uri;
    const server = createApp().listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}`;
    t.after(async () => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      await disconnectDatabase();
      await database.stop();
    });

    await t.test(
      "readiness fails without MongoDB and recovers after connection",
      async () => {
        const unavailable = await fetch(`${base}/health`);
        assert.equal(unavailable.status, 503);
        assert.equal(unavailable.headers.get("cache-control"), "no-store");
        assert.deepEqual(await unavailable.json(), { status: "unavailable" });
        await connectDatabase();
        const ready = await fetch(`${base}/health`);
        assert.equal(ready.status, 200);
        assert.deepEqual(await ready.json(), { status: "ok" });
      },
    );

    await t.test(
      "CORS allows the configured frontend and refuses other origins",
      async () => {
        const allowed = await fetch(`${base}/health`, {
          headers: { Origin: process.env.CLIENT_URL },
        });
        assert.equal(allowed.status, 200);
        assert.equal(
          allowed.headers.get("access-control-allow-origin"),
          process.env.CLIENT_URL,
        );
        assert.equal(
          allowed.headers.get("access-control-allow-credentials"),
          "true",
        );
        const denied = await fetch(`${base}/health`, {
          headers: { Origin: "https://untrusted.example" },
        });
        assert.equal(denied.status, 403);
        assert.equal(denied.headers.get("access-control-allow-origin"), null);
      },
    );

    await t.test(
      "recovery rate limits distinguish clients behind the configured proxy",
      async () => {
        async function recover(ip) {
          return fetch(`${base}/api/v1/auth/forgot-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Forwarded-For": ip,
            },
            body: JSON.stringify({ email: "deployment@example.com" }),
          });
        }
        for (let attempt = 0; attempt < 10; attempt++) {
          const result = await recover("198.51.100.10");
          assert.equal(result.status, 503);
          await result.text();
        }
        assert.equal((await recover("198.51.100.10")).status, 429);
        assert.equal((await recover("198.51.100.11")).status, 503);
      },
    );

    await t.test(
      "production login keeps secure cookies and AI requires authentication",
      async () => {
        const body = {
          email: "deployment@example.com",
          password: "deployment-test-password",
        };
        const signup = await fetch(`${base}/api/v1/auth/user-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        assert.equal(signup.status, 201);
        process.env.NODE_ENV = "production";
        try {
          const login = await fetch(`${base}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          assert.equal(login.status, 200);
          assert.match(login.headers.get("set-cookie"), /; Secure/);
          assert.match(login.headers.get("set-cookie"), /; HttpOnly/);
          assert.match(login.headers.get("set-cookie"), /; SameSite=Lax/);
          const { data } = await login.json();
          assert.equal(
            (await fetch(`${base}/api/v1/ai/chat`, { method: "POST" })).status,
            401,
          );
          const invalidMessage = await fetch(`${base}/api/v1/ai/chat`, {
            method: "POST",
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          assert.equal(invalidMessage.status, 400);
        } finally {
          process.env.NODE_ENV = "test";
        }
      },
    );

    await t.test(
      "readiness reports a later database disconnection",
      async () => {
        await disconnectDatabase();
        assert.equal((await fetch(`${base}/health`)).status, 503);
      },
    );
  },
);

test("proxy configuration rejects invalid hop counts", () => {
  for (const value of ["true", "-1", "1.5"]) {
    process.env.TRUST_PROXY_HOPS = value;
    assert.throws(createApp, /TRUST_PROXY_HOPS/);
  }
  process.env.TRUST_PROXY_HOPS = "0";
  assert.equal(createApp().get("trust proxy"), 0);
});
