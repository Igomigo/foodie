import { Service } from "typedi";
import { AIService } from "./ai.service";
import { Request, Response } from "express";
import { response } from "../interfaces/apiResponse";

@Service()
export class AIController {
    constructor(
        private readonly aiService: AIService
    ) {}

    public async generateText(req: Request, res: Response) {
        try {
            const { prompt } = req.body;
            const result = await this.aiService.generateText(prompt);
            const payload = {
                success: true,
                message: "Text generated successfully",
                data: result
            }
            return response(res, 200, payload);
        } catch (error: any) {
            const payload = {
                success: false,
                message: "Failed to generate text",
                error: error.message
            }
            return response(res, 500, payload);

        }
    }
}