# Static catalogue data

The client and server each contain their own copy of these files. Each application builds and runs using only its local data folder. Location dropdowns read bundled JSON and do not request these lists from an API.

Keep the JSON files and licence files identical in both copies: `client/src/data` and `server/data`. From the repository root, the existing refresh scripts update both locations together:

```sh
node scripts/update-locations.mjs
node scripts/update-lgas.mjs
```

The scripts pin exact upstream revisions. Review changes to those revisions deliberately; refresh is a maintenance task, not part of either application's build or startup. If editing Foodie's food categories, update both copies of `food-categories.json` together.

## Location sources and licences

`countries.json` and `nigeria.json` are extracted from the [Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database), pinned in `scripts/update-locations.mjs`. The Nigeria snapshot contains 36 states plus FCT and 513 city/area entries. The FCT display name is normalized to `Federal Capital Territory`; its `FC` code is retained. City IDs are upstream catalogue IDs, not postcodes, LGA IDs or GeoNames IDs.

The location data is used and redistributed under the [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/); see `LICENSE.locations.txt`. This licence applies to the location data, not the application code.

`nigeria-lgas.json` contains 774 LGAs across the 36 states and FCT, extracted from [Open Admin Data — Nigeria Administrative Divisions](https://github.com/open-admin-data/nigeria-administrative-divisions) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `LICENSE.lgas.txt`. Its source revision is recorded in the JSON and pinned in `scripts/update-lgas.mjs`. Upstream LGA IDs and English names are retained and their parent states are matched to the state codes in the city catalogue.

These community datasets are not an exhaustive official settlement or address register. LGAs are filtered by state, not city: a city may span multiple LGAs. The snapshots do not provide a complete street or neighbourhood directory.

## How the application uses the data

The client fills country/state/city and LGA dropdowns from its local files. The server validates and canonicalizes submitted values using its copy, keeping readable labels alongside `countryCode`, `stateCode`, `cityId` and LGA codes when matched. Existing records are not migrated when the files are refreshed.

Live address search, reverse geocoding and map tiles use the separate Geoapify service. Device location remains explicitly user-triggered. Customer-approved coordinates and kitchen delivery coverage determine nearby results; selecting a city or LGA does not establish a precise address, distance or delivery guarantee. Do not invent missing house numbers, administrative codes or city-to-LGA mappings.

## Food categories

`food-categories.json` is Foodie's own versioned category list. IDs are stable API values; names are display labels. The backend validates menu items against its local file and publishes the list through `GET /api/v1/food-categories`. The client uses that existing endpoint for Discover. “All” is a UI filter, not a stored category. Location dropdowns remain entirely local.
