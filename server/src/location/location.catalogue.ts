interface City {
  id: number;
  name: string;
}
interface State {
  code: string;
  name: string;
  cities: City[];
}

export const nigeria = require("../../data/nigeria.json") as {
  country: string;
  countryCode: string;
  states: State[];
};

const localGovernments = require("../../data/nigeria-lgas.json") as {
  states: { stateCode: string; lgas: { id: string; name: string }[] }[];
};

export function findLocalGovernment(stateCode: string, name: string) {
  return localGovernments.states
    .find((state) => state.stateCode === stateCode)
    ?.lgas.find((lga) => lga.name.toLowerCase() === name.trim().toLowerCase());
}

export function findNigerianState(name: string) {
  const label = name.trim().toLowerCase().replace(/^ng-/, "");
  const withoutState = label.replace(/\s+state$/, "");
  return nigeria.states.find((state) =>
    [
      state.name.toLowerCase(),
      state.code.toLowerCase(),
      ...(state.code === "FC"
        ? ["abuja", "fct", "abuja federal capital territory"]
        : []),
    ].includes(withoutState),
  );
}

export function findNigerianCity(stateCode: string, name: string) {
  let label = name.trim().toLowerCase();
  if (stateCode === "ED" && label === "benin") label = "benin city";
  return nigeria.states
    .find((state) => state.code === stateCode)
    ?.cities.find((city) => city.name.toLowerCase() === label);
}

export function findNigerianLocation(
  country: string,
  stateName: string,
  cityName: string,
) {
  if (!["nigeria", "ng"].includes(country.trim().toLowerCase())) return null;
  const state = findNigerianState(stateName);
  const city = state ? findNigerianCity(state.code, cityName) : undefined;
  if (!state || !city) return null;
  return {
    country: "Nigeria",
    countryCode: "NG",
    state: state.name,
    stateCode: state.code,
    city: city.name,
    cityId: city.id,
  };
}

export function findLocalGovernmentByCode(stateCode: string, code: string) {
  return localGovernments.states
    .find((state) => state.stateCode === stateCode)
    ?.lgas.find((lga) => lga.id === code);
}
