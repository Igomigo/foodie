import nigeria from "../../../shared/data/nigeria.json";
import countries from "../../../shared/data/countries.json";

export { nigeria, countries };

export function findLocation(stateName: string, cityName: string) {
  const state = nigeria.states.find((item) => item.name === stateName);
  const city = state?.cities.find((item) => item.name === cityName);
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

import lgaDirectory from "../../../shared/data/nigeria-lgas.json";

export function localGovernments(stateName: string) {
  const state = nigeria.states.find((item) => item.name === stateName);
  return (
    lgaDirectory.states.find((item) => item.stateCode === state?.code)?.lgas ??
    []
  );
}

export function findLocalGovernment(stateName: string, name: string) {
  return localGovernments(stateName).find((item) => item.name === name);
}
