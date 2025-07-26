import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sparkles } from "lucide-react";

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
      <DialogContent className="bg-red-500 max-w-4xl w-full">
        <Card className="border-none bg-blue-500">
          <CardContent className="p-0 border-none bg-green-500">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <span>AI Food Assistant</span>
                <Badge>AI Assistant</Badge>
              </DialogTitle>
            </DialogHeader>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
