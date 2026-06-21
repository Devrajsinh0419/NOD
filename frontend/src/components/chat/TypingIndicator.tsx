import React from "react"

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 px-4 py-3 bg-[var(--bg-hover)] text-[var(--text-body)] rounded-2xl rounded-tl-sm w-fit border border-[var(--color-accent)]/10">
      <span className="text-sm font-medium text-[var(--text-muted)] mr-1">Kashvi is typing</span>
      <div className="flex space-x-1 items-center h-2">
        <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
        <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: "200ms", animationDuration: "1s" }} />
        <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: "400ms", animationDuration: "1s" }} />
      </div>
    </div>
  )
}
