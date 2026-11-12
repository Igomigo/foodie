import Joi from "joi";
import { foodCategoryIds } from "../domain/food-category";
import {
  findLocalGovernmentByCode,
  nigeria,
} from "../location/location.catalogue";
import { httpError } from "../utils/httpError";

export interface MenuQuery {
  q?: string;
  category?: string;
  page: number;
  limit: number;
}

export interface BrowseQuery extends MenuQuery {
  stateCode: string;
  cityId: number;
  lgaCode?: string;
}

const menuFields = {
  q: Joi.string().trim().min(1).max(80),
  category: Joi.string().valid(...foodCategoryIds),
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
};

const menuQuerySchema = Joi.object(menuFields).unknown(false);
const browseQuerySchema = Joi.object({
  ...menuFields,
  stateCode: Joi.string().trim().uppercase().required(),
  cityId: Joi.number().integer().positive().required(),
  lgaCode: Joi.string().max(100),
})
  .unknown(false)
  .custom((value, helpers) => {
    const state = nigeria.states.find(
      (entry) => entry.code === value.stateCode,
    );
    if (!state?.cities.some((city) => city.id === value.cityId))
      return helpers.message({
        custom: "Choose a city belonging to the selected state",
      });
    if (
      value.lgaCode &&
      !findLocalGovernmentByCode(value.stateCode, value.lgaCode)
    )
      return helpers.message({
        custom: "Choose an LGA belonging to the selected state",
      });
    return value;
  });

export function parseMenuQuery(query: unknown): MenuQuery {
  const { error, value } = menuQuerySchema.validate(query);
  if (error) throw httpError(400, error.details[0].message);
  return value;
}

export function parseBrowseQuery(query: unknown): BrowseQuery {
  const { error, value } = browseQuerySchema.validate(query);
  if (error) throw httpError(400, error.details[0].message);
  return value;
}
