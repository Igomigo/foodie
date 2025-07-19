import { Request, Response } from "express";
import { Service } from "typedi";
import { initializeAIAgent } from "./services/agent.service";

@Service()
export class AIController {
  async chat(req: Request, res: Response) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      // Initialize the agent
      const agent = await initializeAIAgent();

      // Get response from AI
      const result = await agent.invoke({
        input: message,
      });

      return res.status(200).json({
        success: true,
        data: {
          response: result.output,
          conversationId: result.conversationId || "new",
        },
      });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process chat request",
      });
    }
  }
}
