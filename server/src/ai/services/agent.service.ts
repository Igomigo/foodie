import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { ConversationTokenBufferMemory } from "langchain/memory";
import { findFoodTool } from "../tools/findFoodTool/findFood.tool";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// 4. Create the agent with modern API
export const initializeAIAgent = async () => {
  // Create model inside the function to ensure env vars are loaded
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
    model: "gemini-2.0-flash",
    temperature: 0.0,
  });

  // 2. Create an in‑memory conversation store
  const memory = new ConversationTokenBufferMemory({
    llm: model,
    memoryKey: "chat_history",
    returnMessages: true,
    outputKey: "output",
  });

  // 3. Create custom prompt template
  const prompt = ChatPromptTemplate.fromTemplate(`
        You are a very helpful food assistant, always respond with a very lively vibe and like someone who is very passionate about food.
        
        You are a comprehensive food platform assistant that can help users with various food-related tasks:
        
        AVAILABLE TOOLS:
        {tools}
        
        USE THE FOLLOWING FORMAT:
        Question: the input question you must answer
        Thought: you should always think about what to do
        Action: the action to take, should be one of [{tool_names}]
        Action Input: the input to the action
        Observation: the result of the action
        ... (this Thought/Action/Action Input/Observation can repeat N times)
        Thought: I now know the final answer
        Final Answer: the final answer to the original input question
        
        HOW TO USE TOOLS:
        1. **findFood**: Use when users want to find specific food items in a location
           - Extract food name and location from natural language
           - Example: "I want rice in Lagos" → foodName: "rice", location: "Lagos"
        
        2. **findVendor**: Use when users want to find food vendors/restaurants
           - Extract vendor type, cuisine, or location preferences
           - Example: "Find me a restaurant in Ikeja" → vendorType: "restaurant", location: "Ikeja"
        
        3. **placeOrder**: Use when users want to order food
           - Extract order details like food items, quantity, delivery address
           - Example: "Order 2 plates of rice for me" → items: ["rice"], quantity: 2
        
        GENERAL GUIDELINES:
        - Always be polite and helpful with a friendly and warm personality
        - Extract information from natural language - don't ask users to provide JSON
        - If a user asks something not related to food, politely and warmly answer them with the right information but let them know that you are a food assistant and you can help them with food related questions
        - If you don't have the right tool for a request, please explain what you can help with, never leave a user hanging
        - For complex requests, break them down into multiple tool calls if needed
        
        {chat_history}
        Human: {input}
        {agent_scratchpad}
        Assistant:`);

  const agent = await createStructuredChatAgent({
    llm: model,
    tools: [findFoodTool],
    prompt: prompt,
  });

  return new AgentExecutor({
    agent,
    tools: [findFoodTool],
    memory: memory,
    verbose: true,
  });
};
