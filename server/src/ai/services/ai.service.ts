import { GoogleGenAI } from "@google/genai";

export async function generateText(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  return response.text || "";
}
