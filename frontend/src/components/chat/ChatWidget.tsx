"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Bot, RotateCcw, HelpCircle } from "lucide-react"
import ChatMessage, { Message } from "./ChatMessage"
import TypingIndicator from "./TypingIndicator"
import { cn } from "@/lib/utils"

// Quick suggestions for the user to click and ask immediately
const SUGGESTIONS = [
  "What is NOD?",
  "What services do you offer?",
  "What are the roles on this platform?",
  "How are construction costs estimated?",
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am **Kashvi**, your official AI platform assistant. I can help answer questions about Night Owl Designers (NOD), our services, workflows, role permissions, and FAQs. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the bottom whenever messages change or loading state toggles
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isLoading, isOpen])

  const [mounted, setMounted] = useState(false)

  // Hide the initial launcher greeting tooltip after 8 seconds
  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  // Send a message to the backend API route
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    // Create user message
    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Map local messages to the history format expected by the backend
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch AI response")
      }

      // Append AI response
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error("Chat error:", error)
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I am experiencing connection issues. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  // Clear chat history and restart conversation
  const handleResetChat = () => {
    if (window.confirm("Do you want to reset the chat conversation?")) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! I am **Kashvi**, your official AI platform assistant. I can help answer questions about Night Owl Designers (NOD), our services, workflows, role permissions, and FAQs. How can I help you today?",
          timestamp: new Date(),
        },
      ])
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* ── TOOLTIP PROMPT ── */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-18 right-2 mb-2 w-64 rounded-xl border border-[var(--color-accent)]/20 bg-[#1A1714] p-3 text-sm text-[var(--text-body)] shadow-xl"
          >
            <div className="flex items-start gap-2.5">
              <Bot className="h-5 w-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs text-[var(--color-accent)] uppercase tracking-wider">Chat with Kashvi</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Have questions about NOD or our architectural services? Ask me!</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowTooltip(false)
              }}
              className="absolute top-2 right-2 text-[var(--text-ultra-subtle)] hover:text-[var(--text-body)] transition-colors"
              aria-label="Close tooltip"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHAT WINDOW PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "mb-4 flex flex-col rounded-2xl border border-[var(--color-accent)]/15 bg-[#0D0D0D]/95 backdrop-blur-md shadow-2xl overflow-hidden",
              "w-[calc(100vw-2rem)] h-[540px] sm:w-96 sm:h-[580px]",
              "max-h-[80vh]"
            )}
          >
            
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between border-b border-[var(--color-accent)]/10 bg-[#1A1714] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-accent)]/20 bg-[#221F1A] text-[var(--color-accent)]">
                    <Bot className="h-5.5 w-5.5" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#1A1714]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-body)] leading-none">Kashvi</h3>
                  <span className="text-[10px] text-[var(--text-muted)]">NOD AI Assistant</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="rounded-lg p-1.5 text-[var(--text-ultra-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-body)] transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat assistant"
                  className="rounded-lg p-1.5 text-[var(--text-ultra-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-body)] transition-all"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* ── MESSAGE LIST AREA ── */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[var(--color-accent)]/10 scrollbar-track-transparent"
            >
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}

              {isLoading && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>

            {/* ── QUICK SUGGESTION CHIPS ── */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mb-1.5">
                  <HelpCircle className="h-3 w-3" />
                  <span>Suggested questions:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--color-accent)]/10 bg-[#1A1714] text-[var(--text-muted)] hover:border-[var(--color-accent)]/30 hover:text-[var(--text-body)] hover:bg-[var(--bg-hover)] transition-all duration-200 cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── FOOTER INPUT FORM ── */}
            <form
              onSubmit={handleFormSubmit}
              className="border-t border-[var(--color-accent)]/10 bg-[#1A1714] p-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder="Ask Kashvi about NOD docs..."
                className="flex-1 rounded-xl border border-[var(--color-accent)]/10 bg-[#0D0D0D] px-3.5 py-2 text-sm text-[var(--text-body)] placeholder-[var(--text-ultra-subtle)] focus:border-[var(--color-accent)]/40 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 disabled:opacity-40 disabled:hover:bg-[var(--color-accent)] transition-all duration-200 cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LAUNCHER FLOATING BUTTON ── */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen)
          setShowTooltip(false)
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-xl hover:bg-[var(--color-accent)]/90 focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]/20 transition-colors cursor-pointer"
        aria-label="Toggle chat assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  )
}
