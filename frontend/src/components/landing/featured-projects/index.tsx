"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Bookmark, Eye, MapPin, Calendar, DollarSign, User } from "lucide-react"
import { motion } from "framer-motion"

export default function FeaturedProjects() {
  // Setup state for likes and saves
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({})
  const [saves, setSaves] = useState<{ [key: number]: boolean }>({})

  const toggleLike = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setLikes(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const toggleSave = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSaves(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const projects = [
    {
      image: "/images/p1.webp",
      title: "The Obsidian Villa",
      designer: "Aria Sterling",
      budget: "₹18.5M",
      location: "Alibaug, MH",
      duration: "9 Months",
      className: "md:col-span-1 md:row-span-2 h-[550px] md:h-[700px]",
    },
    {
      image: "/images/p2.webp",
      title: "Amber Minimalist Lounge",
      designer: "Vikram Malhotra",
      budget: "₹5.2M",
      location: "New Delhi, DL",
      duration: "4 Months",
      className: "md:col-span-2 md:row-span-1 h-[260px] md:h-[330px]",
    },
    {
      image: "/images/p4.webp",
      title: "Verdant Terrace Penthouse",
      designer: "Ananya Sen",
      budget: "₹8.8M",
      location: "Bengaluru, KA",
      duration: "6 Months",
      className: "md:col-span-1 md:row-span-1 h-[260px] md:h-[330px]",
    },
    {
      image: "/images/p3.webp",
      title: "Form & Light Pavilion",
      designer: "Kabir Mehta",
      budget: "₹12.0M",
      location: "Chandigarh, CH",
      duration: "7 Months",
      className: "md:col-span-1 md:row-span-1 h-[260px] md:h-[330px]",
    },
    {
      image: "/images/p5.webp",
      title: "The Glass House Office",
      designer: "Rohan Das",
      budget: "₹24.0M",
      location: "Gurugram, HR",
      duration: "11 Months",
      className: "md:col-span-2 md:row-span-1 h-[260px] md:h-[330px]",
    },
  ]

  return (
    <section id="projects" className="relative py-36 bg-elevation-1 overflow-hidden px-4 md:px-8">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#C5A880]/4 via-orange-500/1 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* HEADING */}
        <div className="mb-20 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-warm-gold font-bold block mb-4">
            Curated Portfolio
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-ivory leading-tight font-sans">
            Selected Masterpieces
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-warm-silk font-light opacity-90">
            A showcase of architectural marvels and luxury interior spaces crafted by award-winning professionals on NOD.
          </p>
        </div>

        {/* PINTEREST MASONRY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-min">
          {projects.map((project, index) => {
            const isLiked = !!likes[index]
            const isSaved = !!saves[index]

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className={`group relative overflow-hidden rounded-3xl border border-white-subtle bg-elevation-2 shadow-2xl flex flex-col justify-end ${project.className}`}
              >
                
                {/* PROJECT IMAGE */}
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                  loading="lazy"
                />

                {/* GRADIENT OVERLAY (Always present, darkens on hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161618]/90 via-black/30 to-black/10 transition-opacity duration-500 group-hover:via-black/50 group-hover:from-[#161618]/95 z-10" />

                {/* TOP BUTTONS (Like/Save) */}
                <div className="absolute top-5 right-5 z-20 flex gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  
                  {/* LIKE */}
                  <button
                    onClick={(e) => toggleLike(e, index)}
                    className={`h-10 w-10 flex items-center justify-center rounded-full border transition-all duration-300 backdrop-blur-md cursor-pointer ${
                      isLiked 
                        ? "bg-red-500/20 border-red-500/50 text-red-400" 
                        : "bg-[#161618]/45 border-white/10 text-ivory hover:bg-[#161618]/80 hover:text-warm-gold"
                    }`}
                    aria-label="Like project"
                  >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110" : ""} />
                  </button>

                  {/* SAVE */}
                  <button
                    onClick={(e) => toggleSave(e, index)}
                    className={`h-10 w-10 flex items-center justify-center rounded-full border transition-all duration-300 backdrop-blur-md cursor-pointer ${
                      isSaved 
                        ? "bg-[#C5A880]/20 border-[#C5A880]/50 text-warm-gold" 
                        : "bg-[#161618]/45 border-white/10 text-ivory hover:bg-[#161618]/80 hover:text-warm-gold"
                    }`}
                    aria-label="Save project"
                  >
                    <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "scale-110" : ""} />
                  </button>

                </div>

                {/* HOVER OVERLAY DETAILS */}
                <div className="relative z-20 p-6 md:p-8 flex flex-col items-start translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  
                  {/* Title & Designer */}
                  <h3 className="text-2xl font-bold text-ivory leading-snug mb-1 group-hover:text-warm-gold transition-colors duration-300 font-sans">
                    {project.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 mb-4">
                    <User size={12} className="text-soft-cream/70" />
                    <span className="text-xs text-soft-cream font-light">By {project.designer}</span>
                  </div>

                  {/* Stats Grid - Fades in on Hover */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full border-t border-white/10 pt-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                    
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-warm-gold border border-white/5">
                        <DollarSign size={10} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-cool-slate uppercase tracking-wider">Est. Budget</span>
                        <span className="text-xs text-ivory font-medium">{project.budget}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-warm-gold border border-white/5">
                        <MapPin size={10} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-cool-slate uppercase tracking-wider">Location</span>
                        <span className="text-xs text-ivory font-medium">{project.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 col-span-2">
                      <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-warm-gold border border-white/5">
                        <Calendar size={10} />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-[9px] text-cool-slate uppercase tracking-wider">Completion Time</span>
                        <span className="text-xs text-ivory font-medium">{project.duration}</span>
                      </div>
                    </div>

                  </div>

                  {/* View Project Button */}
                  <button className="mt-6 flex items-center gap-1.5 text-xs text-ivory/95 font-bold border-b border-white/20 pb-0.5 hover:text-warm-gold hover:border-warm-gold transition-colors duration-300">
                    <Eye size={12} />
                    <span>View Project Case Study</span>
                  </button>

                </div>

              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}