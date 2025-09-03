// src/App.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebGpuHandler } from "@/packges/qwen3-webgpu";
import { Square } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import Message, { type MessageType } from "./message";

export function ChatBox() {
  const {
    generate,
    message,
    load,
    isCompatible,
    error,
    isLoaded,
    isLoading,
    isRunning,
    stop,
    progressItems,
    messageId,
  } = useWebGpuHandler({ autoload: true });
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const id = nanoid();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input, id },
      { role: "assistant", content: "", id },
    ]);
    generate(input, id, { reason: true });
    setInput("");
  };

  useEffect(() => {
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.role === "user") return msg;
        if (msg.id === msg.id + "think") return msg;

        if (msg.id === messageId) {
          return {
            ...msg,
            content: message.text,
          };
        }
        return msg;
      });
    });
  }, [message, messageId]);

  if (!isCompatible) {
    return (
      <div className=" flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-3xl h-[90vh] pb-0 justify-between shadow-lg rounded-2xl">
          <CardContent className="flex flex-col flex-1 p-0 justify-center items-center">
            <h2 className="text-3xl text-red-400 font-bold">
              Your browser doesn't support WebGPU or GPU Acceleration is
              disabled!
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" flex flex-col items-center justify-center p-4">
      <pre className="text-left hidden">
        {JSON.stringify(messages, undefined, 4)}
      </pre>
      <Card className="w-full max-w-3xl h-[90vh] pb-0 justify-between shadow-lg rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-green-600 font-semibold">
            AI In Browser
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 px-5 py-0">
          <ScrollArea className="flex-1">
            <div className="flex flex-col space-y-4 overflow-y-auto h-[calc(90vh-11rem)]  text-left">
              {messages.map((msg) => (
                <Message
                  key={Math.random()}
                  content={msg.content}
                  role={msg.role}
                  id={msg.id}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="h-16">
            {isLoading && <div className="flex justify-center">Loading</div>}
            {isLoaded && !isLoading && (
              <div className="p-4 flex items-center space-x-2">
                <Input
                  placeholder="Ask me anything about development, coding, or technology..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                {isRunning && (
                  <Button onClick={stop} size="icon">
                    <Square />
                  </Button>
                )}
                {!isRunning && (
                  <Button onClick={sendMessage} size="icon">
                    ➤
                  </Button>
                )}
              </div>
            )}

            {isLoading && (
              <div className="p-3">
                {progressItems.map((item) => (
                  <Progress key={Math.random()} value={item.progress} />
                ))}
              </div>
            )}
            {!isLoaded && (
              <div className="border-t p-3">
                <Button onClick={load}>Load the model</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
