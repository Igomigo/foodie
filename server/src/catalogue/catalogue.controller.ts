import { Request, Response } from "express";
import { foodCategories } from "../domain/food-category";
import { response } from "../interfaces/apiResponse";
import {
  getMenuItem,
  getVendor,
  getVendorMenu,
  listMenuItems,
  listVendors,
} from "./catalogue.service";
import { parseBrowseQuery, parseMenuQuery } from "./catalogue.validation";

export class CatalogueController {
  categories(_req: Request, res: Response) {
    return response(res, 200, {
      success: true,
      message: "Food categories",
      data: foodCategories,
    });
  }

  async vendors(req: Request, res: Response) {
    const data = await listVendors(parseBrowseQuery(req.query));
    return response(res, 200, {
      success: true,
      message: "Kitchens found",
      data,
    });
  }

  async vendor(req: Request, res: Response) {
    const data = await getVendor(req.params.id as string);
    return response(res, 200, {
      success: true,
      message: "Kitchen found",
      data,
    });
  }

  async menu(req: Request, res: Response) {
    const data = await getVendorMenu(
      req.params.id as string,
      parseMenuQuery(req.query),
    );
    return response(res, 200, { success: true, message: "Kitchen menu", data });
  }

  async menuItems(req: Request, res: Response) {
    const data = await listMenuItems(parseBrowseQuery(req.query));
    return response(res, 200, { success: true, message: "Meals found", data });
  }

  async menuItem(req: Request, res: Response) {
    const data = await getMenuItem(req.params.id as string);
    return response(res, 200, { success: true, message: "Meal found", data });
  }
}

export const catalogueController = new CatalogueController();
