import { FilterQuery, PipelineStage, Types } from "mongoose";
import { BrowseQuery, MenuQuery } from "../../catalogue/catalogue.validation";
import { MenuItem, MenuItemModel } from "../../domain/menu-item.model";
import { Vendor, VendorModel } from "../../domain/vendor.model";
import { UserModel } from "../../domain/user.model";
import {
  findLocalGovernmentByCode,
  nigeria,
} from "../../location/location.catalogue";

export interface CatalogueMenuItem extends MenuItem {
  vendor: Vendor;
}

function searchPattern(text: string) {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function locationFilter(query: BrowseQuery): FilterQuery<Vendor> {
  const state = nigeria.states.find((entry) => entry.code === query.stateCode)!;
  const city = state.cities.find((entry) => entry.id === query.cityId)!;
  const conditions: FilterQuery<Vendor>[] = [
    { "address.country": /^(nigeria|ng)$/i },
    {
      $or: [
        { "address.stateCode": state.code, "address.cityId": city.id },
        // Read older label-only locations without rewriting existing records.
        {
          "address.stateCode": { $exists: false },
          "address.cityId": { $exists: false },
          "address.state": state.name,
          "address.city": city.name,
        },
      ],
    },
  ];
  if (query.lgaCode) {
    const lga = findLocalGovernmentByCode(state.code, query.lgaCode)!;
    conditions.push({
      $or: [
        { "address.lgaCode": lga.id },
        { "address.lgaCode": { $exists: false }, "address.lga": lga.name },
      ],
    });
  }
  return { $and: conditions };
}

function publicVendorStages(
  filter: FilterQuery<Vendor>,
): (PipelineStage.Match | PipelineStage.Lookup | PipelineStage.Project)[] {
  return [
    {
      $match: {
        approvalStatus: "approved",
        ...(process.env.NODE_ENV === "production"
          ? { isDemo: { $ne: true } }
          : {}),
        ...filter,
      },
    },
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
      $project: {
        businessName: 1,
        description: 1,
        imageUrl: 1,
        isDemo: 1,
        address: 1,
        approvalStatus: 1,
        acceptingOrders: 1,
        openingHours: 1,
      },
    },
  ];
}

function menuFilter(query: MenuQuery): FilterQuery<MenuItem> {
  const filter: FilterQuery<MenuItem> = { isPublished: true };
  if (query.category) filter.category = query.category;
  if (query.q) {
    const pattern = searchPattern(query.q);
    filter.$or = [{ name: pattern }, { description: pattern }];
  }
  return filter;
}

function pageStages(query: MenuQuery): PipelineStage[] {
  return [
    { $sort: { _id: 1 } },
    { $skip: (query.page - 1) * query.limit },
    { $limit: query.limit + 1 },
  ];
}

export const catalogueRepository = {
  listVendors(query: BrowseQuery) {
    const filter = locationFilter(query);
    if (query.q) filter.businessName = searchPattern(query.q);
    return VendorModel.aggregate<Vendor>([
      ...publicVendorStages(filter),
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
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
          as: "menu",
        },
      },
      { $match: { "menu.0": { $exists: true } } },
      { $unset: "menu" },
      ...pageStages(query),
    ])
      .option({ maxTimeMS: 5000 })
      .exec();
  },
  async findVendor(id: string) {
    const vendors = await VendorModel.aggregate<Vendor>([
      ...publicVendorStages({ _id: new Types.ObjectId(id) }),
      { $limit: 1 },
    ])
      .option({ maxTimeMS: 5000 })
      .exec();
    return vendors[0] ?? null;
  },
  listVendorMenu(vendorId: string, query: MenuQuery) {
    return MenuItemModel.find({ ...menuFilter(query), vendorId })
      .sort({ _id: 1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit + 1)
      .maxTimeMS(5000)
      .lean()
      .exec();
  },
  listMenuItems(query: BrowseQuery) {
    // Limit the kitchen search to the selected location before loading meals.
    return VendorModel.aggregate<CatalogueMenuItem>([
      ...publicVendorStages(locationFilter(query)),
      { $set: { vendor: "$$ROOT" } },
      {
        $lookup: {
          from: MenuItemModel.collection.name,
          localField: "_id",
          foreignField: "vendorId",
          pipeline: [{ $match: menuFilter(query) }],
          as: "items",
        },
      },
      { $unwind: "$items" },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ["$items", { vendor: "$vendor" }] },
        },
      },
      ...pageStages(query),
    ])
      .option({ maxTimeMS: 5000 })
      .exec();
  },
  async findMenuItem(id: string) {
    const items = await MenuItemModel.aggregate<CatalogueMenuItem>([
      { $match: { _id: new Types.ObjectId(id), isPublished: true } },
      {
        $lookup: {
          from: VendorModel.collection.name,
          localField: "vendorId",
          foreignField: "_id",
          pipeline: publicVendorStages({}),
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      { $limit: 1 },
    ])
      .option({ maxTimeMS: 5000 })
      .exec();
    return items[0] ?? null;
  },
};
