import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";

export type MessageType = {
  role: "assistant" | "user";
  content: string;
  id: string;
};
const Message = ({ content, role }: MessageType) => {
  const [isCheckedThinkText, setIsCheckedThinkText] = useState<boolean>(false);
  const [thinkString, setThinkString] = useState<string | null>(null);
  const [cleanString, setCleanString] = useState<string>("");

  useEffect(() => {
    const thinkText = content.match(/<think>([\s\S]*?)<\/think>/);
    const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "");

    if (!isCheckedThinkText && thinkText && thinkText.length > 1) {
      setThinkString(thinkText[1].trim());
      setIsCheckedThinkText(false);
    }

    setCleanString(cleaned);
  }, [content, isCheckedThinkText]);

  return (
    <>
      {!isCheckedThinkText && thinkString && (
        <div className={`flex justify-start`}>
          <Avatar className="mr-2">
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>

          <div
            className={`rounded-sm px-4 w-[66%] shadow bg-gray-100 text-gray-900`}
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="w-full">
                <AccordionTrigger>
                  Thinking: {thinkString.slice(0, 40)} ....
                </AccordionTrigger>
                <AccordionContent>
                  <Markdown>{thinkString}</Markdown>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          {role === "user" && (
            <Avatar className="ml-2">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          )}
        </div>
      )}
      <div
        className={cn(
          "flex",
          role === "user" ? "justify-end" : "justify-start",
          thinkString && !isCheckedThinkText && "block ml-10"
        )}
      >
        {role === "assistant" && !thinkString && (
          <Avatar className="mr-2">
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        <div
          className={`rounded-xl px-4 py-2 max-w-[70%] text-sm shadow ${
            role === "user"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <Markdown>{cleanString}</Markdown>
        </div>
        {role === "user" && (
          <Avatar className="ml-2">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}
      </div>
    </>
  );
};

export default Message;
