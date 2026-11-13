This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to the backend's `/api/v1` URL. The local server defaults to port 2000. Use the deployed HTTPS API URL in production.

Authentication screens share the Foodie auth layout and ordinary Tailwind form components. Signup collects account details first, signs the customer in, then opens the dedicated `/location` step. If the automatic sign-in fails after account creation, it returns to login rather than retrying signup. Both applications read the same versioned location catalogue in `../shared/data`; include that directory when building from a checkout. See its README for data attribution and refresh instructions. Password recovery uses the backend's Nodemailer/SMTP setup documented in `../server/README.md`.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Signed-in experience

`components/app` contains the shared header and mobile navigation. Profile data is shared through the React Query cache. Settings links to the dedicated address flow and retains a separate manual discovery-area editor. The header displays the saved street or area beside the avatar. The shared editor lives in `components/location`. Discover uses the same food-inspiration catalogue and dish preview as the landing page. Search and category filters operate on that inspiration collection; the backend catalogue endpoints are available but Discover is not connected to them yet. Kitchen availability and Ask Amaka are honest upcoming states. Settings wires the existing logout endpoint, then clears the local identity and returns to login.

The shared `PhoneField` uses `react-phone-input-2` with Nigeria selected by default, searchable country codes and the existing field styles. React Hook Form connects it through `Controller`. Local Nigerian numbers can be typed or pasted; international numbers use the selected country code. Both client and server use `libphonenumber-js/max` to validate numbers and normalize submitted values to E.164 (for example, `0801 234 5678` becomes `+2348012345678`). This validates number format, not ownership or reachability.

## Address selection

`/location` offers “Use my current location” and address search, followed by one review screen. The full manual country/state/city/LGA form remains available from Settings and as an area-only fallback. Nigeria is the default; normal automatic selection does not require a chain of administrative dropdowns.

`components/location` separates the flow, search, map, review form and artwork. It reuses the existing Tailwind tokens, shared fields and brand button. Transitions are brief and respect reduced motion. The map sits beside the form on desktop and above it on smaller screens.

`useCurrentLocation` requests a fresh browser position only after a click, then calls the authenticated backend reverse-geocoding endpoint. Search uses `useAddressSearch`, with a 500 ms debounce, cancellation, user-specific query keys and no automatic retries, focus/reconnect refresh or persistent cache. Raw device coordinates and accuracy remain distinct from the provider's nearest address point. Broad area matches require an explicit pin adjustment. No matches, denied permission and provider failures leave manual input available.

The review form asks for street/address, city and state. Apartment, neighbourhood, LGA and postcode appear under optional details. Missing house numbers are never fabricated. Changing a city/state requires another pin review; moving the pin looks up the new address, replaces stale address fields and drops old device accuracy. Apartment/instructions are preserved. Saving is disabled while moving or looking up an address; an unavailable lookup clears stale address fields and allows manual correction at the selected pin. Saving sends only reviewed address fields and an explicit `confirmed: true`; server-owned display labels, IDs and timestamps are not echoed back. The server returns the saved profile through the shared query cache before navigation to Discover or Settings.

Leaflet renders the map. Its custom tile loader calls Foodie's authenticated HTTP service, rather than putting the Geoapify key or access token in an image URL. The server requests Geoapify's high-density OSM Bright PNG tiles with a bounded cache and request limits. Visible Leaflet, Geoapify and OpenStreetMap attribution is retained. Map fetches and object URLs are owned by the map lifecycle. Surrounding loaded tiles are retained while panning; transient tile failures retry once and a reload keeps the current map position. Dragging and touch gestures are available immediately. Desktop wheel/two-finger scrolling pans, while trackpad pinch (ctrl+wheel), touch pinch and the zoom buttons zoom. Pin address lookups wait until movement stops and cancel superseded requests through `usePinAddress`. Resize events preserve the map centre without triggering address changes. An initial Nigeria-wide view is only an overview: it cannot be saved as a customer position; users must zoom to street level and select a pin. Map failures offer a reload and the area-only fallback.

Only `NEXT_PUBLIC_API_URL` is needed on the client. Configure `GEOAPIFY_API_KEY` on the server. No browser-facing mapping key is required. Shared state/city and 774-LGA snapshots remain under `shared/data`, with their attribution and refresh instructions in its README. They are not proof of an address or delivery eligibility.

## Daily Discover banner

Edit `src/data/discover-features.ts` to add or reorder complete banner entries: title, accent, supporting copy, language (`en` or Nigerian Pidgin `pcm`) and `dish: getDish("dish-id")`. Each entry reads its image, alt text and default fit from the shared dish catalogue in `src/data/food-inspiration.ts`, so they stay paired. Use optional `imageFit: "cover"` for wide food compositions with empty vertical margins. The ten entries alternate English and Pidgin; keep each headline pair in one language. The image and wording move together once per day at midnight in Africa/Lagos (UTC+1), including while the page stays open, and wrap at the end of the list. The rotation starts with the first entry on 23 October 2026. `src/data/assistant.ts` holds Amaka’s display name.

Run `npm test` for the daily rotation, address preparation, signup validation and query-hook checks. External geocoding responses and browser positions are mocked.

## Food photography

The new Banga/starch, groundnut/eba, afang/eba, egusi/eba, Oha/akpu, ofada/ayamase, rice/stew and rice/beans images are generated originals, saved locally as high-resolution transparent PNGs. They replace the softer daily JPEGs and the previous Oha cutout. Existing jollof and small-chops images remain. Photo rendering uses quality 90 on the hero, food cards and detail previews.

We checked reusable web photography first. The Commons [BangaSoup photo](https://commons.wikimedia.org/wiki/File:BangaSoup.jpg) is CC BY-SA 4.0, but only 540 px wide and depicts eba rather than starch, so it is not included. No new third-party photograph is downloaded or reused in this update. Older unused source files are retained; this does not establish their provenance.

Culinary references for accurate food pairings and textures: [Sisi Yemmie’s Banga and starch recipe](https://www.youtube.com/watch?v=cZFbLtn6lO0), [Nigerian groundnut soup](https://www.allnigerianrecipes.com/soups/groundnut-soup/), and [Afang soup](https://www.allnigerianrecipes.com/soups/afang-soup/). These informed the brief; their photographs were not used as image inputs.

Current recommendations rotate daily. Morning/afternoon/evening selection remains future work.

## Client API requests

Use TanStack Query v5 hooks in `src/hooks` for server data and actions. Components handle form validation, navigation and messages; services in `src/sevices` make the HTTP requests. Keep new hooks direct: `useQuery` for reads, `useMutation` for actions. Static food catalogues and form fields remain ordinary local state.

`QueryProvider` creates one client per mounted application. Queries stay fresh for one minute, refetch stale data on focus/reconnect, and retry a network/server failure once. Client errors are not retried. Mutations are never retried or queued offline; their inactive cache entries are discarded immediately. No query cache is persisted.

- `useProfile`: one cache entry per user, shared across the header, Discover and Settings. A saved public snapshot is shown during the initial refresh; access tokens are excluded. Requests consume Query’s abort signal.
- `useUpdateLocation`: cancels an older profile read, applies the server’s saved profile, then invalidates that profile query to verify it. Other profile consumers update immediately.
- `useAuth` and `useLogout`: signup, login, recovery, reset and logout mutations. Successful login, password reset and logout cancel old reads and clear previous session caches. Failed logout preserves the session.
- `useAddressSearch`: debounced address suggestions scoped to the current user, with abort signals and no background refetching.
- `useCurrentLocation`: a button-triggered mutation that requests a fresh device position, then calls the reverse-geocoding service. It does not run on mount, focus or reconnect; unmounting aborts the lookup.

Axios still attaches and refreshes authentication tokens; React Query manages the request lifecycle and cache. Public auth requests bypass the refresh interceptor, so an invalid password remains a form error.

Run `npm test` for hook integration checks as well as the location/catalogue tests. Hook tests use React Testing Library with mocked HTTP/browser responses, including deduplication, invalidation, cancellation, session isolation and failure cases. They never contact the external location provider.

References: [TanStack defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [mutation invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations), [query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation).
