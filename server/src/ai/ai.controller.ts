import { Request, Response } from "express";
import { response } from "../interfaces/apiResponse";
import { httpError } from "../utils/httpError";
import { chat } from "./services/chat.service";

export class AIController {
  async chat(req: Request, res: Response) {
    const { message } = req.body ?? {};
    if (typeof message !== "string" || !message.trim()) {
      throw httpError(400, "Message is required");
    }
    const result = await chat(message);
    return response(res, 200, {
      success: true,
      message: "Message processed",
      data: result,
    });
  }
}
