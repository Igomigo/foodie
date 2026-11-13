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

Coverage includes account creation, concurrent duplicates, request sanitization, credential exclusion, vendor-registration transactions and rollback, login, token purpose and expiry, ownership, disabled accounts, logout cookies, legacy migration, catalogue visibility, location/category/search filtering, menu options, pagination and kitchen availability.

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

## Customer catalogue

The catalogue is public and read-only. Routes use the existing `{ success, message, data }` envelope. Vendor signup and account contracts are unchanged.

| Method | Path                       | Result                                                    |
| ------ | -------------------------- | --------------------------------------------------------- |
| GET    | `/api/v1/food-categories`  | Food category IDs and display names                       |
| GET    | `/api/v1/vendors`          | Kitchens in the requested city that have a published menu |
| GET    | `/api/v1/vendors/:id`      | Kitchen details and current availability                  |
| GET    | `/api/v1/vendors/:id/menu` | Kitchen details and a page of published meals             |
| GET    | `/api/v1/menu-items`       | Meals from kitchens in the requested city                 |
| GET    | `/api/v1/menu-items/:id`   | `{ item, vendor }` for a published meal                   |

### Location, search and pagination

`/vendors` and `/menu-items` require `stateCode` and `cityId` from the shared Nigerian directory. Optional `lgaCode` narrows results to kitchens whose recorded address is in that LGA. The city and LGA must each belong to the requested state; there is no assumed city-to-LGA mapping. Label-only legacy addresses can match the canonical city and LGA names without any database rewrite.

These filters describe a kitchen's location, not delivery coverage or exact distance. A delivery destination still needs confirmation and coverage checks when checkout is implemented. Customer coordinates are not accepted by these browsing endpoints.

All lists accept:

- `q`: case-insensitive literal text, 1–80 characters after trimming. Kitchen search matches business names; meal search matches item names and descriptions. Search both endpoints to present kitchen and meal results together.
- `category`: a category ID returned by `/food-categories`. Kitchen results must have a published item in that category.
- `page`: 1–1000, default 1.
- `limit`: 1–50, default 20.

The vendor-specific menu accepts those same search, category and pagination parameters, without location parameters. Invalid IDs, unknown parameters, arrays, invalid locations and invalid pagination return `400`. Missing or hidden detail records return `404`. Empty lists and approved kitchens with an empty menu return `200`.

List data contains `{ items, page, limit, hasMore }`. The vendor menu also includes `vendor`, even when its item list is empty. Results have a stable ascending ID order. This is not a popularity or distance ranking. Filtering happens before pagination. Queries read one additional row for `hasMore` and have a five-second database execution limit.

```sh
curl 'http://localhost:2000/api/v1/food-categories'
curl 'http://localhost:2000/api/v1/vendors?stateCode=ED&cityId=76800'
curl 'http://localhost:2000/api/v1/menu-items?stateCode=ED&cityId=76800&category=soups-swallows&q=banga'
curl 'http://localhost:2000/api/v1/vendors/VENDOR_ID/menu?limit=20'
```

### Visibility and availability

A public kitchen must be approved, with an active owner who still has the vendor role. Pending/suspended kitchens, missing owners and disabled owners are excluded from searches and direct links. Kitchen listings also require at least one published menu item. Closed or paused kitchens remain visible with their actual availability.

Public responses select customer-facing fields explicitly. Owner identity, account credentials, approval internals, publication flags, business contact numbers and stored coordinates are excluded.

`openingHours` contains at most one interval per weekday: `{ day, opensAt, closesAt }`. Days run from Sunday (`0`) to Saturday (`6`). Times use `HH:mm` in `Africa/Lagos`; opening is inclusive and closing is exclusive. A missing day means closed. `22:00`–`02:00` crosses midnight; `00:00`–`24:00` covers a whole day. Equal opening/closing times are invalid. Kitchens start with no hours and `acceptingOrders: false`. Older records without these fields are treated as closed and paused.

`isOpen` reflects the schedule. `isAcceptingOrders` also requires approval and the kitchen's manual `acceptingOrders` setting. A meal's `isAvailable` requires its own stock flag and enough available choices to satisfy each required option. `canOrder` also requires the kitchen to be accepting orders. Published sold-out meals stay visible with `canOrder: false`. Availability describes the current catalogue, not an order reservation; checkout must recheck stock, options and prices.

### Menu records

`menuitems` references `vendors` through `vendorId`. Each meal has a name, category, optional description/image, price, NGN currency, publication and stock flags, and optional choice groups. Prices are non-negative safe integers in **kobo**: `350000` means ₦3,500. Choice prices are extra charges added to the base price.

An option group has a name, `minSelections`, `maxSelections`, and choices with their own name, price and availability. Groups and choices keep stable IDs. A required protein selection could use `minSelections: 1`, `maxSelections: 1`; an optional extra uses `minSelections: 0`. New meals start unpublished. The shared category list lives in `../shared/data/food-categories.json`.

Catalogue writes, approvals and vendor dashboards are separate future work. No public route can create, approve or publish catalogue records. Automated tests populate isolated databases only; this change does not seed, migrate or edit application data.

## Next features

Connect the client to the catalogue, then add basket, checkout and order history. Vendor dashboards, menu editing and order acceptance follow incrementally.

Introduce `Order` with checkout: one vendor per order initially, integer monetary amounts with currency, and embedded snapshots of purchased item names, prices and delivery address. Compute totals on the server. Add vendor staff memberships when multiple operators are needed; ownership and a short roles list are enough for this version.

## Design references

- [DoorDash Marketplace API](https://developer.doordash.com/en-US/api/marketplace/): stores, menus, and orders as separate domain concepts.
- [Uber Eats order details](https://developer.uber.com/docs/eats/references/api/v2/get-eats-order-orderid): store, customer, and purchased-item details.
- [Vendure marketplaces](https://docs.vendure.io/current/framework/how-to/multi-vendor-marketplaces): separation of businesses and dashboard operators.
- [MongoDB data modeling](https://www.mongodb.com/docs/manual/data-modeling/best-practices/): references, embedded data, and historical snapshots.
- [Mongoose 8 transactions](https://mongoosejs.com/docs/8.x/docs/transactions.html) and [validation](https://mongoosejs.com/docs/8.x/docs/validation.html): atomic registration and database-enforced uniqueness.
- [Express error handling](https://expressjs.com/en/guide/error-handling/): rejected async route promises reach centralized error middleware.

These references inform the design; public integration APIs do not establish the platforms' private database schemas.

### Customer discovery location

#### Address lookup service

Set `GEOAPIFY_API_KEY` in the server's untracked `.env` for address lookups. The key stays on the server. Authenticated HTTP endpoints expose the service; the client address-selection screen uses these endpoints for search and live-location lookup.

`src/location/location.service.ts` exports two functions:

- `searchAddresses(text)` returns up to five Nigerian address suggestions for 3–200 characters of search text. Search uses an explicit Nigeria filter and bias, rather than the server's IP location.
- `reverseGeocode({ latitude, longitude })` returns the nearest Nigerian address suggestion, or `null` if there is no supported result.

`location.types.ts` defines Foodie's address format. `geoapify.ts` contains the provider HTTP calls and response mapping. Replacing Geoapify should change this boundary rather than callers throughout the application. No additional packages or provider registry are needed.

Suggestions include a display address, available address components, GeoJSON `[longitude, latitude]`, and a broad precision category (`building`, `street`, `place` or `area`). Missing components remain missing. A building result is not a verified delivery address. Provider county labels are not automatically treated as LGAs. Saving is a separate explicit request that validates and canonicalizes the customer's reviewed fields.

The matched point belongs to the provider's result and can differ from the submitted GPS position. Preserve the device's original point and reported accuracy separately when wiring the confirmation flow. An area-level result must not silently replace a customer's device point or be treated as a house-level match. Every result needs customer review before saving.

Lookups validate inputs, time out after eight seconds and do not retry automatically. Empty or foreign results return no match. Missing configuration, provider errors, malformed responses and network failures return a safe `503` error without propagating credential-bearing request URLs. Display the returned `attribution` and any applicable map/data attribution when the UI is connected.

References: [Geoapify address autocomplete](https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/) and [reverse geocoding](https://apidocs.geoapify.com/docs/geocoding/reverse-geocoding/).

Initial live checks on 13 November 2026 used public road/landmark searches in Benin City, Lagos and Abuja, with two reverse lookups at returned public result coordinates. Lagos and Abuja searches found street/place suggestions; “Ring Road, Benin City” returned only a city-level result. One reverse lookup returned a numbered address about 366 metres from the submitted point, on another street. These samples confirm that the integration works, not comprehensive Nigerian coverage or house-level accuracy. Customer correction and pin confirmation remain essential before this can be used as a delivery-address flow.

#### Address lookup endpoints

Both endpoints require an active session through `Authorization: Bearer <access-token>`. They return suggestions only and never update a saved destination. Address text and coordinates belong in the JSON body, not query parameters. Unknown body fields, query parameters, short/oversized search text, missing coordinates and numeric strings are rejected with `400`.

| Method | Endpoint                    | JSON body                               | Response `data`                                       |
| ------ | --------------------------- | --------------------------------------- | ----------------------------------------------------- |
| POST   | `/api/v1/locations/search`  | `{ "text": "Marina, Lagos" }`           | `{ suggestions: AddressSuggestion[], attribution }`   |
| POST   | `/api/v1/locations/reverse` | `{ "latitude": 6.3, "longitude": 5.6 }` | `{ address: AddressSuggestion \| null, attribution }` |

Successful lookups return `200` with the usual `{ success, message, data }` envelope, including empty suggestions or `address: null` for no supported match. Authentication failures return `401`, rate limits return `429` with `Retry-After`, and provider/configuration failures use the existing generic `503` error response. Location responses include `Cache-Control: no-store`, including validation and authentication failures. Application request logs record only method, the fixed `/api/v1/locations` prefix, status and timing for these routes; they omit address text, coordinates, query strings and authorization headers. Configure deployment/proxy logs to follow the same privacy rule.

The two endpoints share a limit of 30 requests per account per minute. Validated requests also share a conservative allowance of 2,500 attempts per 24-hour window for this server process; failures and empty results count because they can still consume provider credits. Invalid inputs do not consume that daily allowance. This allowance is an application setting in `location.route.ts`, not a guarantee about the Geoapify account's remaining credits. Calls outside these endpoints and map tiles have separate usage implications. Upstream rate limits still return the generic unavailable response; callers should debounce search and avoid automatic retries.

The installed [express-rate-limit](https://express-rate-limit.mintlify.app/reference/configuration) uses in-memory counters here. Counters reset when this process restarts and are not coordinated across replicas. Use a shared store before scaling to multiple server instances or relying on persistent account-wide budgets. No Redis dependency has been added to location lookups for this initial single-process setup.

#### Saving the selected destination

`PATCH /api/v1/users/me/location` derives the customer ID from the authenticated session and returns the updated public profile. Both location input paths use this endpoint and the same `users.location` record. No provider call is made while saving.

Existing `{ location }` requests still support manual country/state/city/LGA selection and optional coordinates. State and city must match the shared catalogue; an LGA, when supplied, must belong to that state. Without explicit confirmation, the server never creates confirmation metadata. `area` remains an optional neighbourhood label (100 characters). `street1` and `street2` are address lines (200 characters each); `zip` is an optional postcode (20 characters).

The new reviewed-address path accepts `{ confirmed: true, location }`:

```json
{
  "confirmed": true,
  "location": {
    "country": "Nigeria",
    "state": "Edo",
    "city": "Benin City",
    "street1": "12 Test Street",
    "street2": "Flat 2",
    "area": "GRA",
    "point": { "type": "Point", "coordinates": [5.62, 6.34] },
    "pointSource": "device",
    "accuracyMeters": 25
  }
}
```

Confirmation requires a street/address line, city/locality label, supported Nigerian state and valid coordinates. Country defaults are a UI concern; the API still validates Nigeria. A house number belongs in `street1` when available; unnumbered addresses can use a useful street/landmark description instead. A separate apartment or delivery-detail line can use `street2`. LGA and postcode are optional, so missing provider data does not force users through every administrative dropdown.

Canonical state/city IDs are derived from the shared catalogue when confidently matched. Known provider labels such as “Edo State”, “Lagos State”, “FCT” and Edo's “Benin” alias are normalized. A locality absent from our city directory can be stored as reviewed text with a pin, but receives no invented `cityId`. Supplied codes must agree with matched labels; explicit LGAs must match the state, and missing LGAs remain missing.

`pointSource` is required for confirmation: `device` for the original browser position, `search` for a selected search result or `pin` for a customer-positioned map pin. Device positions require numeric `accuracyMeters` from 0 to 5,000; search/pin positions must omit device accuracy. Preserve the original GPS point when using `device`, rather than substituting a nearby reverse-geocoding result. Pin source and device accuracy are customer-submitted information, not proof of location.

The server generates `confirmedAt` and `formattedAddress` from the reviewed components. Clients cannot set these fields. `confirmedAt` records customer review, not provider verification, delivery eligibility or a successful delivery. Both automatic and manual address/pin selection must wait for the customer to confirm before submitting this path.

Confirmed requests replace the destination, including optional fields: omitted apartment, postcode or neighbourhood details from the previous destination are removed. For compatibility, an older manual form that sends the identical point and area can omit detailed address fields without erasing them. Changing the point, region/area or supplied address details invalidates that preservation. A manual region-only replacement clears previous coordinates and address confirmation. This avoids mixing an old house address with a new city or pin.

User profile and location-save responses use `Cache-Control: no-store`. Application logs for location saves omit URL query contents, recording only a fixed route label, method, status and timing. Existing records are not migrated. The client now provides the confirmation screen; coordinate-based kitchen discovery remains separate work, and the existing catalogue endpoints still require their documented city filters.

Storage follows [MongoDB's GeoJSON coordinate order](https://www.mongodb.com/docs/manual/reference/geojson/): longitude first, then latitude. The selected address remains an embedded user location rather than a separate address-book feature.

### Address map tiles

`GET /api/v1/locations/tiles/:z/:x/:y` serves PNG tiles through the authenticated session. Tile indices are range-checked for zoom 0–19. The backend calls Geoapify's high-density Positron raster endpoint with `GEOAPIFY_API_KEY`; neither that key nor the provider URL is returned to the browser. HTML, non-PNG responses, invalid signatures and oversized images are rejected with a safe unavailable error. The existing fixed-prefix location logger and `no-store` response policy apply.

The provider module caches up to 64 public map images for an hour and staggers uncached tile requests by 300 ms, with a bounded six-second queue wait. Tile routes use separate limits: 120 requests per account per minute and 1,000 requests per 24-hour window for this server process. Cache hits conservatively count toward these request limits. These limits do not share geocoding counters and do not represent the provider's exact remaining balance; use shared counters before scaling server replicas.

The client loads tiles through its authenticated HTTP service and Leaflet's grid-layer API, with attribution visible. The public OpenStreetMap tile server is not used. See [Geoapify map tiles](https://apidocs.geoapify.com/docs/maps/map-tiles/) for the raster URL format and attribution requirements.
