import { Request, Response } from "express";
import { isObjectIdOrHexString } from "mongoose";
import { response } from "../interfaces/apiResponse";
import { httpError } from "../utils/httpError";
import { getUserById, updateUserLocation } from "./user.service";
import { PublicUser } from "./user.presenter";

export class UserController {
  async updateLocation(req: Request, res: Response) {
    const user = await updateUserLocation(
      res.locals.user.userId,
      req.body.location,
    );
    return response(res, 200, {
      success: true,
      message: "Location updated",
      data: user,
    });
  }

  async getUserById(req: Request, res: Response) {
    const id = req.params.id as string;
    if (!isObjectIdOrHexString(id)) throw httpError(400, "Invalid user ID");
    const currentUser: PublicUser = res.locals.user;
    if (
      currentUser.userId !== id.toLowerCase() &&
      !currentUser.roles.includes("admin")
    ) {
      throw httpError(403, "You cannot access this user");
    }
    const user = await getUserById(id);
    return response(res, 200, {
      success: true,
      message: "User found",
      data: user,
    });
  }
}

export const userController = new UserController();
