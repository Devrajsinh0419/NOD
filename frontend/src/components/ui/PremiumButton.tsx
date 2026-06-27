"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PremiumButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "gold" | "copper" | "outline" | "text"
  className?: string
  href?: string
  ariaLabel: string
  disabled?: boolean
}

export default function PremiumButton({
  children,
  onClick,
  variant = "gold",
  className,
  href,
  ariaLabel,
  disabled = false,
}: PremiumButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center rounded-full px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden cursor-pointer select-none text-center"

  const variantStyles = {
    gold: "bg-[#C9A96E] text-[#070708] shadow-[0_0_20px_rgba(201,169,110,0.15)] hover:shadow-[0_0_30px_rgba(201,169,110,0.35)] hover:bg-[#D4C4A8] border border-[#C9A96E]",
    copper:
      "bg-[#C27D38] text-[#FDFDF6] shadow-[0_0_20px_rgba(194,125,56,0.15)] hover:shadow-[0_0_30px_rgba(194,125,56,0.35)] hover:bg-[#D28E4A] border border-[#C27D38]",
    outline:
      "bg-transparent text-[#FDFDF6] border border-[#C9A96E]/30 hover:border-[#C9A96E] hover:bg-[#C9A96E]/10",
    text: "bg-transparent text-[#C9A96E] hover:text-[#FDFDF6] p-0 tracking-[0.15em] border-none shadow-none",
  }

  const renderContent = () => (
    <>
      {/* Glow Layer on hover (only for solid variants) */}
      {(variant === "gold" || variant === "copper") && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#FAFAFC]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={cn(baseStyles, variantStyles[variant], className)}
      >
        {renderContent()}
      </a>
    )
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {renderContent()}
    </motion.button>
  )
}
