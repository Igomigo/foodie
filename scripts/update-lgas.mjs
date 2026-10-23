import { mkdir, readFile, writeFile } from "node:fs/promises";

const commit = "7b42d69f9cf85136acc6ee1bfa023944831e4d3d";
const base = `https://raw.githubusercontent.com/open-admin-data/nigeria-administrative-divisions/${commit}`;
const directory = new URL("../shared/data/", import.meta.url);
const nigeria = JSON.parse(
  await readFile(new URL("nigeria.json", directory), "utf8"),
);
async function download(path) {
  const response = await fetch(`${base}/${path}`);
  if (!response.ok) throw new Error(`LGA download failed: ${response.status}`);
  return response;
}
const rows = await (await download("data/all-lga.json")).json();
const states = nigeria.states.map((state) => ({
  stateCode: state.code,
  lgas: rows
    .filter((row) => row.parent.name.en === state.name)
    .map((row) => ({ id: row.id, name: row.name.en }))
    .sort((a, b) => a.name.localeCompare(b.name)),
}));
if (
  rows.length !== 774 ||
  states.some((state) => !state.lgas.length) ||
  states.reduce((count, state) => count + state.lgas.length, 0) !== 774
)
  throw new Error("Expected 774 LGAs across 36 states and FCT");
await mkdir(directory, { recursive: true });
await writeFile(
  new URL("nigeria-lgas.json", directory),
  JSON.stringify(
    {
      source: {
        url: "https://github.com/open-admin-data/nigeria-administrative-divisions",
        commit,
        license: "CC-BY-4.0",
      },
      states,
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  new URL("LICENSE.lgas.txt", directory),
  await (await download("LICENSE")).text(),
);
console.log("Saved 774 LGAs across 37 states/FCT.");
