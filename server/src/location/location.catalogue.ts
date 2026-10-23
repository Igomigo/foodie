interface City {
  id: number;
  name: string;
}
interface State {
  code: string;
  name: string;
  cities: City[];
}

export const nigeria = require("../../../shared/data/nigeria.json") as {
  country: string;
  countryCode: string;
  states: State[];
};

const localGovernments = require("../../../shared/data/nigeria-lgas.json") as {
  states: { stateCode: string; lgas: { id: string; name: string }[] }[];
};

export function findLocalGovernment(stateCode: string, name: string) {
  return localGovernments.states
    .find((state) => state.stateCode === stateCode)
    ?.lgas.find((lga) => lga.name.toLowerCase() === name.trim().toLowerCase());
}

export function findNigerianLocation(
  country: string,
  stateName: string,
  cityName: string,
) {
  if (!["nigeria", "ng"].includes(country.trim().toLowerCase())) return null;
  const state = nigeria.states.find((item) =>
    [
      item.name.toLowerCase(),
      item.code.toLowerCase(),
      ...(item.code === "FC"
        ? ["abuja", "fct", "abuja federal capital territory"]
        : []),
    ].includes(stateName.trim().toLowerCase()),
  );
  const city = state?.cities.find(
    (item) => item.name.toLowerCase() === cityName.trim().toLowerCase(),
  );
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
