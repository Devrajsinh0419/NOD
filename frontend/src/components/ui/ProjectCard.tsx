"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Bookmark, Heart, Share2, MapPin, DollarSign, Clock, User } from "lucide-react"

interface ProjectCardProps {
  image: string
  title: string
  location: string
  budget: string
  designer: string
  completionTime: string
  category: string
  index?: number
}

export default function ProjectCard({
  image,
  title,
  location,
  budget,
  designer,
  completionTime,
  category,
  index = 0,
}: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out ${title} by ${designer} on Night Owl Designers`,
        url: window.location.href,
      }).catch(console.error)
    } else {
      alert("Link copied to clipboard!")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full h-[450px] overflow-hidden rounded-[2.5rem] bg-[#0B0B0C] border border-[#C9A96E]/10"
    >
      {/* Image Container with Zoom effect */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        {/* Dark overlay & radial gradient for high-contrast reading */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/90 via-[#070708]/40 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-95" />
      </div>

      {/* Top badges & actions */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center">
        <span className="px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#070708]/80 text-[#C9A96E] border border-[#C9A96E]/20 backdrop-blur-md">
          {category}
        </span>

        <div className="flex gap-2">
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsLiked(!isLiked)
            }}
            aria-label={`Like project ${title}`}
            className={`p-2.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
              isLiked
                ? "bg-[#C27D38] border-[#C27D38] text-white"
                : "bg-[#070708]/60 border-[#C9A96E]/15 text-[#FAFAFC] hover:border-[#C9A96E]/50"
            }`}
          >
            <Heart size={14} className={isLiked ? "fill-current" : ""} />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsBookmarked(!isBookmarked)
            }}
            aria-label={`Bookmark project ${title}`}
            className={`p-2.5 rounded-full border backdrop-blur-md transition-all duration-300 ${
              isBookmarked
                ? "bg-[#C9A96E] border-[#C9A96E] text-[#070708]"
                : "bg-[#070708]/60 border-[#C9A96E]/15 text-[#FAFAFC] hover:border-[#C9A96E]/50"
            }`}
          >
            <Bookmark size={14} className={isBookmarked ? "fill-current" : ""} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            aria-label={`Share project ${title}`}
            className="p-2.5 rounded-full bg-[#070708]/60 border border-[#C9A96E]/15 text-[#FAFAFC] hover:border-[#C9A96E]/50 backdrop-blur-md transition-all duration-300"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* Details (reveal on hover, basic info always visible) */}
      <div className="absolute bottom-0 left-0 w-full p-8 z-20 flex flex-col justify-end">
        {/* Title */}
        <h3 className="text-2xl font-cormorant font-light text-[#FDFDF6] leading-tight mb-2 tracking-wide">
          {title}
        </h3>

        {/* Location & Designer always visible */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#FAFAFC]/70 mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-[#C9A96E]" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} className="text-[#C9A96E]" />
            {designer}
          </span>
        </div>

        {/* Expandable panel for Budget and Completion Time */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-[#C9A96E]/10 pt-4 mt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#C9A96E]/60 mb-1">
                    Est. Budget
                  </p>
                  <p className="text-sm font-semibold text-[#FDFDF6] flex items-center">
                    <DollarSign size={12} className="text-[#C9A96E]" />
                    {budget}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#C9A96E]/60 mb-1">
                    Timeline
                  </p>
                  <p className="text-sm font-semibold text-[#FDFDF6] flex items-center gap-1">
                    <Clock size={12} className="text-[#C9A96E]" />
                    {completionTime}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
