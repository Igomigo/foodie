import { Request, Response } from "express";
import { response } from "../interfaces/apiResponse";
import { setDemoUser, getDemoUser } from "./base.service";

export class BaseController {
  greet(_req: Request, res: Response) {
    return response(res, 200, {
      success: true,
      message: "Hello World, welcome to flavourCompass",
    });
  }
  async setUser(req: Request, res: Response) {
    await setDemoUser(req.body);
    return response(res, 201, {
      success: true,
      message: "User set successfully",
      data: req.body,
    });
  }
  async getUser(req: Request, res: Response) {
    const result = await getDemoUser(req.params.key as string);
    return response(res, 200, {
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  }
}

export const baseController = new BaseController();
