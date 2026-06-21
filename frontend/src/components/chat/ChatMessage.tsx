import React from "react"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Message {
  role: "user" | "assistant"
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

/**
 * Parses a simple markdown string and returns React nodes.
 * Supports: **bold**, lists (* or -), and double newlines for paragraphs.
 */
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split content into paragraphs or list items
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let inList = false;

  const parseInlineBold = (lineText: string): React.ReactNode[] => {
    const parts = lineText.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      // Alternating parts are bolded
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-[var(--color-accent)]">{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Check for bullet list item
    const isBullet = trimmedLine.startsWith("* ") || trimmedLine.startsWith("- ");
    
    if (isBullet) {
      const itemContent = trimmedLine.substring(2);
      currentList.push(
        <li key={`li-${lineIndex}`} className="ml-4 list-disc mb-1 text-sm leading-relaxed">
          {parseInlineBold(itemContent)}
        </li>
      );
      inList = true;
    } else {
      // If we were in a list, close it first
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`ul-${lineIndex}`} className="mb-3 space-y-0.5">
            {currentList}
          </ul>
        );
        currentList = [];
        inList = false;
      }

      if (trimmedLine) {
        elements.push(
          <p key={`p-${lineIndex}`} className="mb-2 text-sm leading-relaxed text-[var(--text-body)]">
            {parseInlineBold(trimmedLine)}
          </p>
        );
      } else {
        // Empty line acts as a spacer
        elements.push(<div key={`spacer-${lineIndex}`} className="h-2" />);
      }
    }
  });

  // If list is still open, push it
  if (inList && currentList.length > 0) {
    elements.push(
      <ul key="ul-final" className="mb-3 space-y-0.5">
        {currentList}
      </ul>
    );
  }

  return <div>{elements}</div>;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isKashvi = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3",
        isKashvi ? "justify-start" : "justify-end"
      )}
    >
      {/* Avatar Icon */}
      {isKashvi && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border border-[var(--color-accent)]/20 bg-[#221F1A] text-[var(--color-accent)] shadow-sm">
          <Bot className="h-4.5 w-4.5" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all duration-200 border",
          isKashvi
            ? "rounded-tl-sm bg-[#1A1714] text-[var(--text-body)] border-[var(--color-accent)]/15"
            : "rounded-tr-sm bg-[var(--color-accent)] text-white border-[var(--color-accent)]/8"
        )}
      >
        {/* Name Header */}
        <div className="flex items-center justify-between gap-4 mb-1 select-none">
          <span
            className={cn(
              "text-[11px] font-medium tracking-wider uppercase",
              isKashvi ? "text-[var(--color-accent)]" : "text-[#F5F0E8]/70"
            )}
          >
            {isKashvi ? "Kashvi" : "You"}
          </span>
          <span
            className={cn(
              "text-[9px]",
              isKashvi ? "text-[var(--text-muted)]" : "text-[#F5F0E8]/60"
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Message Content */}
        <div className={cn("break-words", !isKashvi && "text-white")}>
          {isKashvi ? (
            parseMarkdown(message.content)
          ) : (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {!isKashvi && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-[var(--bg-hover)] text-[var(--text-body)] border border-[var(--color-accent)]/20 shadow-sm">
          <User className="h-4.5 w-4.5" />
        </div>
      )}
    </div>
  );
}
