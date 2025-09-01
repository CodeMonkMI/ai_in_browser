// src/App.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help you with coding questions, explain concepts, and provide guidance on web development topics. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <div className=" flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-3xl h-[80vh] flex flex-col shadow-lg rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-green-600 font-semibold">
            AI In Browser
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col space-y-4 text-left">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="mr-2">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-xl px-4 py-2 max-w-[70%] text-sm shadow ${
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="ml-2">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-3 flex items-center space-x-2">
            <Input
              placeholder="Ask me anything about development, coding, or technology..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button disabled={!input.length} onClick={sendMessage} size="icon">
              ➤
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
