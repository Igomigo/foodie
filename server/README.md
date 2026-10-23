# Backend

Express 5, TypeScript, and Mongoose. Routes register handlers, controllers handle HTTP, services implement business rules, and repositories contain database queries. Controllers are classes; the other layers use functions or exported objects.

## Development

1. Copy `.env.example` to `.env` and fill in the MongoDB and Redis credentials and `JWT_SECRET_KEY`. Generate a signing secret with `openssl rand -hex 32`. Set `GOOGLE_API_KEY` when using chat.
2. Run `npm ci`.
3. Run `docker compose up --build` to run the stack, or `docker compose up -d mongodb redis` followed by `npm run dev` to run Node on the host.

For host development, set `MONGODB_URI` using the example in `.env.example`. Docker Compose sets the internal database hostname automatically. Use URL-safe local MongoDB credentials or URL-encode credentials in connection strings. Never commit `.env`.

MongoDB must support transactions: use a replica set, a sharded cluster, or Atlas. The local Compose stack initializes a single-node replica set with authentication. The replica key is generated once and stored in a Docker volume. Keep the MongoDB image version compatible with any existing data volume when upgrading. This Compose setup is for local development.

The server validates its signing secret, waits for MongoDB and indexes, and then starts listening. Shutdown stops HTTP traffic before closing database and Redis connections. Redis is lazy and only used by development demo endpoints; account creation, login, and profile retrieval do not depend on it.

## Checks

```sh
npm run build
npm run format:check
npm test
```

Tests start a temporary local `mongod` replica set, use a random database and HTTP port, and clean up afterward. Install `mongod`, or set `TEST_MONGODB_URI` to a dedicated replica set you can use for tests. The test runner creates and drops its own randomly named `foodie_test_*` database; it does not use the application database configured in `.env`.

Coverage includes account creation, concurrent duplicates, request sanitization, credential exclusion, vendor-registration transactions and rollback, login, token purpose and expiry, ownership, disabled accounts, logout cookies, and legacy migration.

Run `npm run format` or `npx prettier --write . --ignore-unknown` from `server` to format supported source, test, configuration, and documentation files. Generated output, dependencies, and local environment files are ignored.

## Models and authentication

- `users`: one identity per person, with globally unique normalized email, optional unique username, hidden password hash, profile fields, and server-assigned roles.
- `vendors`: one food outlet per owner for now. `ownerId` references a user. Business details and approval status live here; credentials do not.

New customers receive `roles: ["user"]`. Vendor owners receive `["user", "vendor"]` and a pending vendor record. New accounts are active by default; business approval is a separate decision. Admin privileges cannot be granted through public signup.

Vendor signup creates both records in one transaction. An existing customer can register a vendor using the same email and correct password; the service adds the vendor role to that identity. Wrong credentials, inactive accounts, and a second vendor for the same owner are rejected.

The existing `/api/v1/auth/user-signup`, `/vendor-signup`, `/login`, `/refresh-token`, and `/logout` paths remain. The singular `role` response field remains for client compatibility, alongside `roles` and `userId`. Its precedence is admin, vendor, then user. The refresh response includes both `data.accessToken` and a top-level `accessToken` for the existing interceptor.

Access tokens expire after five minutes; refresh tokens after seven days. Token verification checks the signing algorithm, token purpose, and user ID. Protected requests load current roles and account status from MongoDB. `GET /api/v1/users/:id` requires the account owner or an admin. API responses explicitly select public user fields.

Logout clears the refresh cookie. Issued tokens are stateless: copied refresh tokens are not revoked by logout, and access tokens remain usable until expiry unless the account is disabled. Per-device sessions and refresh-token rotation are future authentication work. Legacy tokens without a purpose claim require signing in again after deployment.

### Password recovery

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `MAIL_FROM` in your local environment using your SMTP provider's credentials. Nodemailer uses TLS on port 465 and requires STARTTLS on other ports (normally 587). Set `CLIENT_URL` to the frontend origin; HTTPS is required in production. No credentials are committed, and no emails are sent during automated tests.

- `POST /api/v1/auth/forgot-password` accepts `{ email }`. Configured requests return the same `202` message for known and unknown accounts. Missing SMTP configuration returns `503` without claiming an email was sent. Account lookup and email delivery run asynchronously in the server process; a process restart can interrupt delivery, so the user can retry. SMTP failures are logged without credentials or reset tokens.
- `POST /api/v1/auth/reset-password` accepts `{ token, password, confirmPassword }`. Tokens contain 32 random bytes, are stored only as SHA-256 hashes, expire after 20 minutes, and are consumed atomically. A reset increments the account's token version, invalidating all previous access and refresh tokens, and sends a password-change notification. The user signs in again afterward.
- Reset links use a URL fragment to avoid including the secret in access logs and referrers. Recovery requests are limited to ten attempts per IP per fifteen minutes, with a database-enforced one-minute email cooldown per account. The IP limiter is currently per process; use a shared store when deploying multiple server instances, and configure Express's trusted proxy settings for the actual deployment topology.

### Nigerian locations

New signup locations are validated against the shared, versioned catalogue in `../shared/data`. The client uses the same catalogue for dependent country/state/city pickers. Nigeria is the only enabled country. Matching labels are canonicalized, and `countryCode`, `stateCode`, and `cityId` are stored alongside existing readable names. Mismatched states/cities or identifiers are rejected. Existing records are not rewritten.

The catalogue contains 36 states plus FCT and 513 city/area entries. It is community-maintained, not an exhaustive settlement register. See its README for source, licence, refresh instructions, and deployment requirements. City selection supports broad local discovery; exact distance ranking needs separately consented customer coordinates and vendor coordinates, rather than city-centre estimates.

The Redis `/set-user` and `/get-user/:key` demos are available only with `NODE_ENV=development`, use a separate `demo:user:*` namespace, and expire after fifteen minutes. They are not account-management APIs.

## Existing accounts

The old discriminator records are stored in `accounts`; the application now reads `users` and `vendors`. For an existing installation, stop application writes, back up the database, and inspect a dry run before switching traffic:

```sh
npm run migrate:accounts
```

The default is read-only. To apply the prepared migration deliberately:

```sh
npm run migrate:accounts -- --apply
```

The migration preflights all source identities and destination collisions, preserves IDs, password hashes, timestamps, and vendor approval, and leaves the original `accounts` collection intact. Vendor IDs remain the old account IDs so existing favorites can still refer to them. Each account and vendor pair is migrated atomically. Interrupted runs can be rerun; existing destination records are not overwritten. Keep application writes stopped until the migration finishes.

Existing `isActive: false` values are preserved. The old schema defaulted this field to false even though login did not enforce it. Review inactive accounts and explicitly activate eligible accounts before switching traffic; the migration reports their count and does not silently enable them. Old Redis profile caches are no longer read.

## Next features

Build the customer experience first: vendor/menu browsing, then checkout and order history. Vendor/menu records can initially be seeded or managed internally. Vendor dashboards, menu editing, and order acceptance come afterward.

Introduce `MenuItem` when browsing is built, using `vendorId` on each item. Introduce `Order` with checkout: one vendor per order initially, integer monetary amounts with currency, and embedded snapshots of purchased item names, prices, and delivery address. Compute totals on the server. Add vendor staff memberships when multiple operators are needed; ownership and a short roles list are enough for this version.

## Design references

- [DoorDash Marketplace API](https://developer.doordash.com/en-US/api/marketplace/): stores, menus, and orders as separate domain concepts.
- [Uber Eats order details](https://developer.uber.com/docs/eats/references/api/v2/get-eats-order-orderid): store, customer, and purchased-item details.
- [Vendure marketplaces](https://docs.vendure.io/current/framework/how-to/multi-vendor-marketplaces): separation of businesses and dashboard operators.
- [MongoDB data modeling](https://www.mongodb.com/docs/manual/data-modeling/best-practices/): references, embedded data, and historical snapshots.
- [Mongoose 8 transactions](https://mongoosejs.com/docs/8.x/docs/transactions.html) and [validation](https://mongoosejs.com/docs/8.x/docs/validation.html): atomic registration and database-enforced uniqueness.
- [Express error handling](https://expressjs.com/en/guide/error-handling/): rejected async route promises reach centralized error middleware.

These references inform the design; public integration APIs do not establish the platforms' private database schemas.

### Customer discovery location

`PATCH /api/v1/users/me/location` accepts `{ location }` and derives the customer ID from the authenticated session. It validates and canonicalizes state/city and optional LGA codes against the shared catalogues. New client signups and location edits ask for an LGA; the server preserves compatibility with existing clients that only send city/state. Optional `area` is a neighbourhood/street label (100 characters). Optional `point` is GeoJSON `[longitude, latitude]`, with optional `accuracyMeters`. Coordinates are range-checked device input, not a verified address or delivery promise. Replacing a location without coordinates removes old coordinates. No existing records are migrated.
