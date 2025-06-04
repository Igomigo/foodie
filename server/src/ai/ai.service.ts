import { GoogleGenAI } from "@google/genai";
import { Service } from "typedi";

@Service()
export class AIService {
    private readonly ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
    }

    public async generateText(prompt: string): Promise<string> {
        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt
            });

            return response.text || "";
        } catch (error) {
            throw new Error("Failed to generate text");
        }
    }
}
