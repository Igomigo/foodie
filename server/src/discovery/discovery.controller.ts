import { Request, Response } from "express";
import { response } from "../interfaces/apiResponse";
import { parseMenuQuery } from "../catalogue/catalogue.validation";
import { discoverKitchens, discoverKitchenMenu } from "./discovery.service";
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
