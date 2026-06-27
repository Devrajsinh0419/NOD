"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon?: ReactNode
  title: string
  description: string
  className?: string
  index?: number
}

export default function FeatureCard({
  icon,
  title,
  description,
  className,
  index = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={cn(
        "group relative rounded-[2rem] bg-[#0B0B0C]/80 border border-[#C9A96E]/10 p-8 overflow-hidden backdrop-blur-xl transition-all duration-500 hover:border-[#C9A96E]/30",
        className
      )}
    >
      {/* Background soft glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-[#C9A96E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Decorative top gold line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A96E]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />

      {/* Icon Wrapper */}
      {icon && (
        <div className="mb-6 inline-flex p-3 rounded-2xl bg-[#111112] border border-[#C9A96E]/15 text-[#C9A96E] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#C9A96E]/10 group-hover:border-[#C9A96E]/30">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-cormorant font-light text-[#FDFDF6] mb-3 tracking-wide group-hover:text-[#C9A96E] transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#FAFAFC]/70 font-sans leading-relaxed group-hover:text-[#FAFAFC]/90 transition-colors duration-300">
        {description}
      </p>

      {/* Subtle bottom arrow/glow indicator */}
      <div className="mt-6 flex justify-end">
        <span className="text-xs text-[#C9A96E]/40 group-hover:text-[#C9A96E] group-hover:translate-x-1 transition-all duration-300">
          →
        </span>
      </div>
    </motion.div>
  )
}
