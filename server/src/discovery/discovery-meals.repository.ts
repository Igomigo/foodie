import { searchPattern } from "../utils/searchPattern";
import { PipelineStage } from "mongoose";
import { MenuItem, MenuItemModel } from "../domain/menu-item.model";
import { VendorModel } from "../domain/vendor.model";
import { foodCategoryValues } from "../domain/food-category";
import { acceptingOrdersExpression } from "./discovery-availability";
import {
  activeOwnerStages,
  candidateStages,
  DiscoveryKitchen,
} from "./discovery.repository";
import { DiscoveryDestination } from "./discovery-location";
import { DiscoveryQuery } from "./discovery.validation";

export interface DiscoveryMeal extends MenuItem {
  kitchen: DiscoveryKitchen;
}
function publishedMeals(
  query: DiscoveryQuery,
  limitPerKitchen?: number,
): PipelineStage[] {
  const pattern = query.q ? searchPattern(query.q) : undefined;
  return [
    {
      $lookup: {
        from: MenuItemModel.collection.name,
        localField: "_id",
        foreignField: "vendorId",
        pipeline: [
          {
            $match: {
              isPublished: true,
              ...(limitPerKitchen ? { isAvailable: true } : {}),
              ...(query.category
                ? { category: { $in: foodCategoryValues(query.category) } }
                : {}),
            },
          },
          ...(limitPerKitchen
            ? [{ $sort: { _id: 1 as const } }, { $limit: limitPerKitchen }]
            : []),
        ],
        as: "meals",
      },
    },
    { $unwind: "$meals" },
    ...(pattern
      ? [
          {
            $match: {
              $or: [
                { businessName: pattern },
                { "meals.name": pattern },
                { "meals.description": pattern },
              ],
            },
          },
        ]
      : []),
  ];
}
function availableMealExpression() {
  return {
    $and: [
      "$kitchenOpen",
      { $eq: ["$meals.isAvailable", true] },
      {
        $allElementsTrue: [
          {
            $map: {
              input: { $ifNull: ["$meals.options", []] },
              as: "option",
              in: {
                $gte: [
                  {
                    $size: {
                      $filter: {
                        input: "$$option.choices",
                        as: "choice",
                        cond: { $eq: ["$$choice.isAvailable", true] },
                      },
                    },
                  },
                  "$$option.minSelections",
                ],
              },
            },
          },
        ],
      },
    ],
  };
}
export function findDiscoveryMeals(
  destination: DiscoveryDestination,
  query: DiscoveryQuery,
  now: Date,
  limitPerKitchen?: number,
) {
  return VendorModel.aggregate<DiscoveryMeal>([
    ...candidateStages(destination),
    ...activeOwnerStages(),
    { $set: { kitchenOpen: acceptingOrdersExpression(now) } },
    ...(query.openOnly ? [{ $match: { kitchenOpen: true } }] : []),
    ...publishedMeals(query, limitPerKitchen),
    { $set: { mealAvailable: availableMealExpression() } },
    {
      $sort: {
        mealAvailable: -1,
        ...(destination.mode === "nearby"
          ? { distanceMeters: 1 as const }
          : {}),
        "meals._id": 1,
      },
    },
    { $skip: (query.page - 1) * query.limit },
    { $limit: query.limit + 1 },
    {
      $project: {
        meals: 1,
        businessName: 1,
        imageUrl: 1,
        bannerUrl: 1,
        logoUrl: 1,
        address: 1,
        approvalStatus: 1,
        acceptingOrders: 1,
        openingHours: 1,
        isDemo: 1,
        distanceMeters: 1,
      },
    },
    { $set: { kitchen: "$$ROOT" } },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ["$meals", { kitchen: "$kitchen" }] },
      },
    },
  ])
    .option({ maxTimeMS: 5000 })
    .exec();
}
export function findDiscoveryCategories(destination: DiscoveryDestination) {
  return VendorModel.aggregate<{ _id: string; count: number }>([
    ...candidateStages(destination),
    ...activeOwnerStages(),
    {
      $lookup: {
        from: MenuItemModel.collection.name,
        localField: "_id",
        foreignField: "vendorId",
        pipeline: [
          { $match: { isPublished: true } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ],
        as: "categories",
      },
    },
    { $unwind: "$categories" },
    {
      $group: { _id: "$categories._id", count: { $sum: "$categories.count" } },
    },
  ])
    .option({ maxTimeMS: 5000 })
    .exec();
}
