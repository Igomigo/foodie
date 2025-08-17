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
import { Sparkles } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "./ui/button";

// Chat Suggestions
const chatSuggestions = [
  "I want to eat rice and beans in Vi, Lagos?",
  "What foods are available in my location?",
  "What vendors sell rice in my location?",
];

// Chat History
const chatHistory = [
  {
    role: "user",
    content: "What is the best food in Lagos?",
  },
  {
    role: "assistant",
    content:
      "The best food in Lagos is Jollof Rice. I can help you find the best food in Lagos.",
  },
  {
    role: "user",
    content: "What is the best food in Abuja?",
  },
  {
    role: "assistant",
    content: "The best food in Abuja is Suya",
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
      <DialogContent className="max-w-4xl p-0 m-3">
        <Card className="border-white w-full">
          <CardHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold">Foodie AI</h2>
                <Badge variant={"secondary"}>AI Assistant</Badge>
              </div>
            </DialogTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 pb-4">
              <div className="bg-gray-300 w-full px-4 py-2 rounded-lg">
                <p className="text-sm">
                  Hi! I'm your AI food assistant. I can help you find the
                  perfect African dishes based on your mood, location, and
                  preferences. What are you craving today?
                </p>
              </div>
              {/** Chat Suggestions */}
              <div className="flex items-center gap-2">
                {chatSuggestions.map((suggestion) => (
                  <Button
                    className="text-xs rounded-full hover:ring-4 hover:ring-offset-1 hover:ring-gray-300"
                    key={suggestion}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              {/** Chat container */}
              <div className="flex flex-col gap-4">
                <div></div>
              </div>
            </div>
            {/* <DotLottieReact
              src="https://lottie.host/656889b5-09ae-40c6-9a76-ada6e367d02c/MXWWG6jO7B.lottie"
              loop
              autoplay
              className="w-20 h-10"
            /> */}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
