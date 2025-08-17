import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Bot } from "lucide-react";
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
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
} from "./ui/shadcn-io/ai/input";
import { AISuggestion, AISuggestions } from "./ui/shadcn-io/ai/suggestion";

// Chat Suggestions
const chatSuggestions = [
  "I want to eat rice and beans in Vi, Lagos?",
  "What foods are available in my location?",
  "What vendors sell rice in my location?",
  "What is the best food in Lagos?",
  "What is the best food in Abuja?",
  "How can I get a food delivery in Lagos?",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
    avatar: "images/userr.png",
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
      <DialogContent className="max-w-4xl max-h-fit m-3">
        <DialogHeader className="border-b border-orange-500 pb-4">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Bot className="text-orange-500 w-6 h-6" />
              <h2 className="text-xl font-bold">Foodie AI</h2>
              <Badge variant={"secondary"}>AI Assistant</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        <AISuggestions>
          {chatSuggestions.map((suggestion) => (
            <AISuggestion
              key={suggestion}
              onClick={() => {}}
              suggestion={suggestion}
            />
          ))}
        </AISuggestions>
        <AIConversation className="overflow-y-auto max-h-[60vh] scrollbar">
          <AIConversationContent>
            {chatHistory.map((chat, index) => (
              <div key={index}>
                <AIMessage from={chat.role}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      {chat.role === "assistant" && (
                        <AIMessageAvatar src={chat.avatar} name={chat.role} />
                      )}
                      <AIMessageContent>
                        <p className={`text-sm $`}>{chat.content}</p>
                      </AIMessageContent>
                      {chat.role === "user" && (
                        <AIMessageAvatar src={chat.avatar} name={chat.role} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {chat.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      •{" "}
                      {chat.createdAt.toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </AIMessage>
              </div>
            ))}
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
        <AIInput className="relative" onSubmit={() => {}}>
          <AIInputTextarea className="pr-12" />{" "}
          {/* Add right padding to prevent text overlapping with button */}
          <AIInputSubmit className="absolute bg-orange-500 hover:bg-orange-600 right-2 top-1/2 -translate-y-1/2" />{" "}
          {/* Center vertically using transform */}
        </AIInput>
      </DialogContent>
    </Dialog>
  );
}
