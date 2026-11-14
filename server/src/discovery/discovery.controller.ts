import { Request, Response } from "express";
import { response } from "../interfaces/apiResponse";
import { parseMenuQuery } from "../catalogue/catalogue.validation";
import {
  discoverKitchens,
  discoverKitchenMenu,
  discoverMeals,
  discoveryFeed,
  discoveryMeal,
} from "./discovery.service";
import { parseDiscoveryQuery } from "./discovery.validation";

export class DiscoveryController {
  async kitchens(req: Request, res: Response) {
    const data = await discoverKitchens(
      res.locals.user.location,
      parseDiscoveryQuery(req.query),
    );
    return response(res, 200, {
      success: true,
      message: "Kitchens for your location",
      data,
    });
  }
  async meals(req: Request, res: Response) {
    const data = await discoverMeals(
      res.locals.user.location,
      parseDiscoveryQuery(req.query),
    );
    return response(res, 200, {
      success: true,
      message: "Meals for your location",
      data,
    });
  }
  async feed(req: Request, res: Response) {
    parseDiscoveryQuery(req.query);
    if (Object.keys(req.query).length)
      return response(res, 400, {
        success: false,
        message: "Feed does not accept query parameters",
      });
    const data = await discoveryFeed(res.locals.user.location);
    return response(res, 200, {
      success: true,
      message: "Discover your local menu",
      data,
    });
  }
  async meal(req: Request, res: Response) {
    if (Object.keys(req.query).length)
      return response(res, 400, {
        success: false,
        message: "Meal details do not accept query parameters",
      });
    const data = await discoveryMeal(
      res.locals.user.location,
      req.params.id as string,
      req.params.mealId as string,
    );
    return response(res, 200, { success: true, message: "Meal details", data });
  }
  async menu(req: Request, res: Response) {
    const data = await discoverKitchenMenu(
      res.locals.user.location,
      req.params.id as string,
      parseMenuQuery(req.query),
    );
    return response(res, 200, { success: true, message: "Kitchen menu", data });
  }
}
export const discoveryController = new DiscoveryController();
