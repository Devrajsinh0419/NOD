"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, CheckCircle, ArrowUpRight, DollarSign, Briefcase, Calendar } from "lucide-react"

interface DesignerCardProps {
  coverImage: string
  avatarImage: string
  name: string
  role: string
  rating: number
  reviewsCount: number
  projectsCount: number
  hourlyRate: string
  availability: "Available Now" | "Booking Next Month" | "Fully Booked"
  verified?: boolean
  index?: number
}

export default function DesignerCard({
  coverImage,
  avatarImage,
  name,
  role,
  rating,
  reviewsCount,
  projectsCount,
  hourlyRate,
  availability,
  verified = true,
  index = 0,
}: DesignerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getAvailabilityColor = () => {
    if (availability === "Available Now") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    if (availability === "Booking Next Month") return "bg-amber-500/10 text-amber-400 border-amber-500/20"
    return "bg-rose-500/10 text-rose-400 border-rose-500/20"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="group relative overflow-hidden rounded-[2.5rem] bg-[#0B0B0C] border border-[#C9A96E]/10 hover:border-[#C9A96E]/30 transition-colors duration-500 w-full"
    >
      {/* Cover Image */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={coverImage}
          alt={`${name}'s portfolio cover`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0B0B0C]" />
      </div>

      {/* Profile Details Container */}
      <div className="relative px-6 pb-6 pt-0 flex flex-col items-center -mt-10">
        {/* Avatar */}
        <div className="relative h-20 w-20 rounded-full border-4 border-[#0B0B0C] overflow-hidden bg-[#111112] shadow-xl mb-3">
          <Image
            src={avatarImage}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        {/* Name and Verified Badge */}
        <div className="flex items-center gap-1.5 justify-center mb-1">
          <h3 className="text-lg font-semibold text-[#FDFDF6] group-hover:text-[#C9A96E] transition-colors duration-300">
            {name}
          </h3>
          {verified && (
            <CheckCircle size={14} className="text-[#C9A96E] fill-[#C9A96E]/10" />
          )}
        </div>

        {/* Role */}
        <p className="text-xs text-[#FAFAFC]/60 uppercase tracking-widest mb-3">
          {role}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4 bg-[#111112] px-3 py-1 rounded-full border border-[#C9A96E]/10">
          <Star size={12} className="text-[#C9A96E] fill-current" />
          <span className="text-xs font-semibold text-[#FDFDF6]">{rating}</span>
          <span className="text-[10px] text-[#FAFAFC]/40">({reviewsCount} reviews)</span>
        </div>

        {/* Static Details Grid */}
        <div className="grid grid-cols-2 gap-3 w-full border-t border-[#C9A96E]/10 pt-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#111112] text-[#C9A96E]">
              <Briefcase size={12} />
            </div>
            <div>
              <p className="text-[9px] text-[#FAFAFC]/40 uppercase tracking-wider">Projects</p>
              <p className="text-xs font-semibold text-[#FDFDF6]">{projectsCount}+ Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#111112] text-[#C9A96E]">
              <DollarSign size={12} />
            </div>
            <div>
              <p className="text-[9px] text-[#FAFAFC]/40 uppercase tracking-wider">Rate</p>
              <p className="text-xs font-semibold text-[#FDFDF6]">{hourlyRate}/hr</p>
            </div>
          </div>
        </div>

        {/* Hover Expandable area */}
        <motion.div
          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden w-full flex flex-col items-center"
        >
          {/* Availability */}
          <div className="w-full flex justify-center mb-4">
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${getAvailabilityColor()}`}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
              {availability}
            </span>
          </div>

          {/* Action button */}
          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C9A96E] hover:bg-[#D4C4A8] text-[#070708] py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 mt-1">
            View Portfolio
            <ArrowUpRight size={14} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
