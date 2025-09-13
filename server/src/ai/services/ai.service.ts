import { GoogleGenAI } from "@google/genai";
import { Service } from "typedi";

@Service()
export class AIService {
    private readonly ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    }

    /**
     * Generate text using Google GenAI
     * @param prompt - The prompt to generate text from
     * @returns The generated text
     */
    public async generateText(prompt: string): Promise<string> {
        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt
            });

            return response.text || "";
        } catch (error: any) {
            console.error(error.message);
            throw new Error("Failed to generate text");
        }
    }
}
