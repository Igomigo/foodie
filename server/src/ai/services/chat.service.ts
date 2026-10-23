import { initializeAIAgent } from "./agent.service";

export async function chat(message: string) {
  const agent = await initializeAIAgent();
  const result = await agent.invoke({ input: message });
  return {
    response: result.output,
    conversationId: result.conversationId || "new",
  };
}
