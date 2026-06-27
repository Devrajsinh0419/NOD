"use client"

import { motion } from "framer-motion"

interface SectionHeadingProps {
  subtitle: string
  title: string
  description?: string
  align?: "left" | "center" | "right"
}

export default function SectionHeading({
  subtitle,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const getAlignClass = () => {
    if (align === "left") return "text-left items-start"
    if (align === "right") return "text-right items-end"
    return "text-center items-center"
  }

  return (
    <div className={`flex flex-col ${getAlignClass()} max-w-3xl mx-auto mb-16 space-y-4`}>
      {/* Subtitle with premium letter-spacing */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-xs md:text-sm uppercase tracking-[0.35em] text-[#C9A96E] font-medium"
      >
        {subtitle}
      </motion.p>

      {/* Main Title using luxury Cormorant Garamond serif */}
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-3xl md:text-5xl font-cormorant font-light text-[#FDFDF6] leading-tight"
      >
        {title}
      </motion.h2>

      {/* Divider Accent line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "60px" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent my-2"
      />

      {/* Supporting Paragraph */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm md:text-base text-[#FAFAFC]/75 font-sans leading-relaxed max-w-2xl"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}
