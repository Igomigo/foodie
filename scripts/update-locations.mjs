import { mkdir, writeFile } from "node:fs/promises";

// Pin updates so the client and server always use the same location catalogue.
const commit = "cc7cf13bbfd86110ff6658097802d57d81be5319";
const base = `https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/${commit}`;
const directory = new URL("../shared/data/", import.meta.url);

async function download(path) {
  const response = await fetch(`${base}/${path}`);
  if (!response.ok)
    throw new Error(`Location download failed: ${response.status}`);
  return response;
}

const countryData = await (
  await download("json/countries+states+cities.json")
).json();
const nigeria = countryData.find((country) => country.iso2 === "NG");
const catalogue = {
  country: "Nigeria",
  countryCode: "NG",
  states: nigeria.states
    .map((state) => ({
      code: state.iso2,
      name: state.iso2 === "FC" ? "Federal Capital Territory" : state.name,
      cities: state.cities.map((city) => ({ id: city.id, name: city.name })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
};
if (
  catalogue.states.length !== 37 ||
  catalogue.states.some((state) => !state.cities.length)
) {
  throw new Error(
    "Expected Nigeria's 36 states and FCT, each with city entries",
  );
}

const countries = countryData.map((country) => ({
  code: country.iso2,
  name: country.name,
}));
await mkdir(directory, { recursive: true });
await writeFile(
  new URL("nigeria.json", directory),
  JSON.stringify(catalogue, null, 2) + "\n",
);
await writeFile(
  new URL("countries.json", directory),
  JSON.stringify(countries, null, 2) + "\n",
);
await writeFile(
  new URL("LICENSE.locations.txt", directory),
  await (await download("LICENSE")).text(),
);
console.log(
  `Saved ${catalogue.states.length} states/FCT and ${catalogue.states.reduce((count, state) => count + state.cities.length, 0)} cities/areas.`,
);
