# Location catalogue

Nigeria's 36 states and Federal Capital Territory, with 513 city/area entries, are extracted from the [Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database). Both applications use these same JSON files. No external API is called during signup.

The exact upstream revision is pinned in `scripts/update-locations.mjs`. Run `node scripts/update-locations.mjs` from the repository root to reproduce the snapshot. Review and update the pinned revision intentionally when refreshing it. The FCT display name is normalized to `Federal Capital Territory`; its `FC` code is retained. City identifiers are upstream catalogue IDs, not postcode, LGA, or GeoNames identifiers.

This is a community-maintained catalogue, not an exhaustive official settlement register. Entries include cities and urban areas. Review coverage and corrections before expanding service areas; do not silently substitute an LGA for a city or a city centre for a customer's position.

Names are preserved for the existing API contract. New signup locations also receive `countryCode`, `stateCode`, and `cityId` on the server. Existing records are not migrated. City selection is a discovery preference, not a verified address or GPS position. Exact distance matching will require customer-approved coordinates and vendor coordinates separately.

## Attribution and licence

Contains information from the Countries States Cities Database, used under the [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). The extracted location catalogue is also available under ODbL 1.0. See `LICENSE.locations.txt` for the full licence. This licence applies to the location data, not the application code.

Keep the shared data directory available alongside `server/` in deployments, since the compiled backend reads it at runtime.

## Local government areas

`nigeria-lgas.json` contains 774 LGAs across the 36 states and FCT, extracted from [Open Admin Data — Nigeria Administrative Divisions](https://github.com/open-admin-data/nigeria-administrative-divisions), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `LICENSE.lgas.txt`. This is a separate dataset from the ODbL city directory. The source revision is included in the JSON and pinned in `scripts/update-lgas.mjs`; run `node scripts/update-lgas.mjs` to reproduce the extraction. We retain upstream LGA IDs and English names, map their parent states to our state codes, and sort names for the picker.

LGAs are filtered by state, not city: one city may cross multiple LGAs. The directory does not provide exhaustive streets or neighbourhoods. An optional free-text `area` captures a neighbourhood or street without inventing catalogue IDs. These community datasets need review as coverage expands; neither the picker nor the free-text field verifies an address.

Signed-in customers can use browser geolocation from Settings, with explicit permission and HTTPS (or localhost). The browser sends the freshly obtained coordinates directly to [BigDataCloud’s free client-side reverse-geocoding endpoint](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api). No API key is required. Follow its [fair use policy](https://www.bigdatacloud.com/docs/article/fair-use-policy-for-free-client-side-reverse-geocoding-api): only current, permissioned coordinates from the calling device; never stored coordinates, server-side requests, automated fixture requests, or batch lookups. The form explains the coordinates/IP disclosure and links to the provider’s privacy notice. Tests mock every provider request.

Detected state/city/LGA names are matched against our shared catalogues. City aliases are explicit (for example Benin → Benin City), not fuzzy or nearest-city guesses. Only returned administrative LGA/council boundaries can fill an LGA; city names are not used to infer one. Missing city/LGA matches are cleared for manual selection, rather than retaining a previous address. An unlisted locality may fill the optional neighbourhood field. Provider coverage can be incomplete. Require the customer to review and save; this is not a verified address or a delivery guarantee. Reject IP-only results and device accuracy worse than 5 km.

Store GeoJSON as `[longitude, latitude]`, with reported accuracy in metres. Changing a known location clears the device position; filling a previously missing city or LGA within the detected state retains it. Do not use city centres as customer coordinates. Vendor positions, service areas and distance matching remain future work.
