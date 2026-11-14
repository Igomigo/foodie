import Joi from "joi";
import { foodCategoryIds } from "../domain/food-category";
import { httpError } from "../utils/httpError";

export interface DiscoveryQuery {
  q?: string;
  category?: string;
  openOnly: boolean;
  page: number;
  limit: number;
}

const querySchema = Joi.object({
  q: Joi.string().trim().min(1).max(80),
  category: Joi.string().valid(...foodCategoryIds),
  openOnly: Joi.boolean().default(false),
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(30).default(12),
}).unknown(false);

export function parseDiscoveryQuery(query: unknown): DiscoveryQuery {
  const { error, value } = querySchema.validate(query);
  if (error) throw httpError(400, error.details[0].message);
  return value;
}
