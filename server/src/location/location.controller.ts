import { Request, Response } from "express";
import { response } from "../interfaces/apiResponse";
import {
  locationAttribution,
  reverseGeocode,
  searchAddresses,
} from "./location.service";

export class LocationController {
  async search(req: Request, res: Response) {
    const suggestions = await searchAddresses(req.body.text);
    return response(res, 200, {
      success: true,
      message: suggestions.length
        ? "Address suggestions"
        : "No addresses found",
      data: { suggestions, attribution: locationAttribution },
    });
  }

  async reverse(req: Request, res: Response) {
    const address = await reverseGeocode(req.body);
    return response(res, 200, {
      success: true,
      message: address ? "Address suggestion" : "No address found",
      data: { address, attribution: locationAttribution },
    });
  }
}

export const locationController = new LocationController();
