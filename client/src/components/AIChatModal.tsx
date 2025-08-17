import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bot, Sparkles } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "./ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "./ui/shadcn-io/ai/conversation";
import {
  AIMessage,
  AIMessageAvatar,
  AIMessageContent,
} from "./ui/shadcn-io/ai/message";

// Chat Suggestions
const chatSuggestions = [
  "I want to eat rice and beans in Vi, Lagos?",
  "What foods are available in my location?",
  "What vendors sell rice in my location?",
];

type ChatHistory = {
  role: "user" | "assistant";
  content: string;
  avatar: string;
  createdAt: Date;
};

// Chat History
const chatHistory: ChatHistory[] = [
  {
    role: "user",
    content: "What is the best food in Lagos?",
    avatar: "images/user.png",
    createdAt: new Date(),
  },
  {
    role: "assistant",
    content:
      "The best food in Lagos is Jollof Rice. I can help you find the best food in Lagos.",
    avatar: "images/bot.png",
    createdAt: new Date(),
  },
  {
    role: "user",
    content: "What is the best food in Abuja?",
    avatar: "images/user.png",
    createdAt: new Date(),
  },
  {
    role: "assistant",
    content: "The best food in Abuja is Suya",
    avatar: "images/bot.png",
    createdAt: new Date(),
  },
  {
    role: "user",
    content: "What is the best food in Lagos?",
    avatar: "images/user.png",
    createdAt: new Date(),
  },
  {
    role: "assistant",
    content:
      "The best food in Lagos is Jollof Rice. I can help you find the best food in Lagos.",
    avatar: "images/bot.png",
    createdAt: new Date(),
  },
  {
    role: "user",
    content: "What is the best food in Abuja?",
    avatar: "images/user.png",
    createdAt: new Date(),
  },
  {
    role: "assistant",
    content: "The best food in Abuja is Suya",
    avatar: "images/bot.png",
    createdAt: new Date(),
  },
];

export default function AIChatModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl m-3">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Bot className="text-orange-500 w-6 h-6" />
              <h2 className="text-xl font-bold">Foodie AI</h2>
              <Badge variant={"secondary"}>AI Assistant</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <AIConversation>
          <AIConversationContent>
            {chatHistory.map((chat, index) => (
              <AIMessage key={index} from={chat.role}>
                <AIMessageContent>
                  <p>{chat.content}</p>
                </AIMessageContent>
                <AIMessageAvatar src={chat.avatar} name={chat.role} />
              </AIMessage>
            ))}
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
      </DialogContent>
    </Dialog>
  );
}
