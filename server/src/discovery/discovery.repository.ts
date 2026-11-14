import { PipelineStage, Types } from "mongoose";
import { Vendor, VendorModel } from "../domain/vendor.model";
import { UserModel } from "../domain/user.model";
import { MenuItemModel } from "../domain/menu-item.model";
import { acceptingOrdersExpression } from "./discovery-availability";
import { DiscoveryDestination } from "./discovery-location";
import { DiscoveryQuery } from "./discovery.validation";

export interface DiscoveryKitchen extends Vendor {
  distanceMeters?: number;
  categories: string[];
}

function literalPattern(text: string) {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function candidateStages(
  destination: DiscoveryDestination,
  vendorId?: string,
): PipelineStage[] {
  const visible = {
    approvalStatus: "approved",
    ...(process.env.NODE_ENV === "production" ? { isDemo: { $ne: true } } : {}),
    ...(vendorId ? { _id: new Types.ObjectId(vendorId) } : {}),
    "address.country": /^(ng|nigeria)$/i,
  };
  if (destination.mode === "nearby")
    return [
      {
        $geoNear: {
          near: destination.point!,
          key: "address.point",
          distanceField: "distanceMeters",
          maxDistance: 30000,
          spherical: true,
          query: visible,
        },
      },
      {
        $match: {
          deliveryRadiusMeters: { $gte: 100, $lte: 30000 },
          $expr: { $lte: ["$distanceMeters", "$deliveryRadiusMeters"] },
        },
      },
    ];
  return [
    {
      $match: {
        ...visible,
        $or: [
          ...(destination.cityId
            ? [
                {
                  "address.stateCode": destination.stateCode,
                  "address.cityId": destination.cityId,
                },
              ]
            : []),
          {
            "address.state": destination.state,
            "address.city": destination.city,
          },
        ],
      },
    },
  ];
}

function ownerAndMenuStages(query: DiscoveryQuery): PipelineStage[] {
  return [
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: "ownerId",
        foreignField: "_id",
        pipeline: [
          { $match: { isActive: true, roles: "vendor" } },
          { $project: { _id: 1 } },
        ],
        as: "owner",
      },
    },
    { $match: { "owner.0": { $exists: true } } },
    {
      $lookup: {
        from: MenuItemModel.collection.name,
        localField: "_id",
        foreignField: "vendorId",
        pipeline: [
          {
            $match: {
              isPublished: true,
              ...(query.category ? { category: query.category } : {}),
            },
          },
          { $project: { name: 1, description: 1, category: 1 } },
        ],
        as: "menu",
      },
    },
    {
      $match: {
        "menu.0": { $exists: true },
        ...(query.q
          ? {
              $or: [
                { businessName: literalPattern(query.q) },
                { "menu.name": literalPattern(query.q) },
                { "menu.description": literalPattern(query.q) },
              ],
            }
          : {}),
      },
    },
    { $set: { categories: { $setUnion: ["$menu.category", []] } } },
  ];
}

export function findDiscoveryKitchens(
  destination: DiscoveryDestination,
  query: DiscoveryQuery,
  now: Date,
  vendorId?: string,
) {
  return VendorModel.aggregate<DiscoveryKitchen>([
    ...candidateStages(destination, vendorId),
    ...ownerAndMenuStages(query),
    { $set: { sortOpen: acceptingOrdersExpression(now) } },
    ...(query.openOnly ? [{ $match: { sortOpen: true } }] : []),
    {
      $sort: {
        sortOpen: -1,
        ...(destination.mode === "nearby"
          ? { distanceMeters: 1 as const }
          : {}),
        _id: 1,
      },
    },
    { $skip: (query.page - 1) * query.limit },
    { $limit: query.limit + 1 },
    {
      $project: {
        businessName: 1,
        description: 1,
        imageUrl: 1,
        address: 1,
        approvalStatus: 1,
        acceptingOrders: 1,
        openingHours: 1,
        isDemo: 1,
        distanceMeters: 1,
        categories: 1,
      },
    },
  ])
    .option({ maxTimeMS: 5000 })
    .exec();
}
