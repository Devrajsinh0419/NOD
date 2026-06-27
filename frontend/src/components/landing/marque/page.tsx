"use client"

import { motion } from "framer-motion"
import { Sparkles, Layers, Box, Hexagon, CircleDot, Database, Compass, Wind } from "lucide-react"

export default function Marquee() {
  const logos = [
    { name: "Architect", icon: Compass },
    { name: "Contracter", icon: Box },
    { name: "Designer", icon: Hexagon },
    { name: "Interiors", icon: CircleDot },
    { name: "Vastu", icon: Sparkles },
    { name: "Structural Designer", icon: Wind },
    { name: "Exterior", icon: Database },
  ]

  // Double the list for a seamless marquee loop
  const marqueeLogos = [...logos, ...logos]

  return (
    <div className="relative border-y border-white-subtle bg-elevation-1 py-10 overflow-hidden pointer-events-auto">
      {/* LEFT/RIGHT SHADOW GRADIENTS TO BLEND EDGES */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-elevation-1 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-elevation-1 to-transparent z-10 pointer-events-none" />

      {/* MARQUEE CONTAINER */}
      <div className="marquee flex items-center whitespace-nowrap">
        {marqueeLogos.map((logo, index) => {
          const Icon = logo.icon
          return (
            <div
              key={index}
              className="flex items-center gap-3 mx-12 text-soft-cream/40 hover:text-warm-gold hover:scale-[1.03] transition-all duration-300 cursor-pointer group"
            >
              <Icon size={20} className="stroke-[1.5] transition-transform duration-500 group-hover:rotate-12" />
              <span className="text-sm font-semibold tracking-[0.25em] uppercase font-sans">
                {logo.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}