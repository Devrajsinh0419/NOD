"use client"

import { motion } from "framer-motion"
import { Compass, HardHat, Trees, Layers, Sparkles, Building2, Eye, Paintbrush } from "lucide-react"

export default function FeaturedServices() {
  const services = [
    {
      title: "Interior Design",
      description: "Sophisticated interior environments blending luxury, utility, and exquisite materials.",
      icon: Paintbrush,
      badge: "Residential",
    },
    {
      title: "Architecture",
      description: "Visionary structural designs combining structural integrity with sculptural elegance.",
      icon: Compass,
      badge: "Master Planning",
    },
    {
      title: "Construction",
      description: "Flawless engineering and general contracting executed to the highest quality standards.",
      icon: HardHat,
      badge: "Civil Build",
    },
    {
      title: "Landscape",
      description: "Lush, custom outdoor environments curated to align perfectly with structural layouts.",
      icon: Trees,
      badge: "Eco-Design",
    },
    {
      title: "Furniture Design",
      description: "Signature bespoke furnishings created by master craftsmen for custom projects.",
      icon: Layers,
      badge: "Artisanal",
    },
    {
      title: "3D Visualization",
      description: "Photorealistic 3D rendering and immersive virtual tours to visualize before you build.",
      icon: Eye,
      badge: "Interactive VR",
    },
    {
      title: "Renovation",
      description: "Restructuring and modernizing aged properties while maintaining historical character.",
      icon: Sparkles,
      badge: "Refit",
    },
    {
      title: "Commercial Spaces",
      description: "Strategic layout and high-end design for modern offices, retail stores, and hotels.",
      icon: Building2,
      badge: "Corporate",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  } as const

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
  } as const


  return (
    <section id="services" className="relative py-36 bg-elevation-0 overflow-hidden px-4 md:px-8">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A880]/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/2 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* HEADING */}
        <div className="mb-20 text-center relative z-10">
          <span className="text-xs uppercase tracking-[0.3em] text-warm-gold font-bold block mb-4">
            Our Specialties
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-ivory leading-tight font-sans">
            Premium Services We Offer
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-warm-silk font-light opacity-90">
            Connecting you with specialized design practices and builders capable of executing complex, bespoke architecture projects.
          </p>
        </div>

        {/* SERVICES GRID */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
        >
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group relative rounded-2xl border border-white-subtle bg-elevation-2/95 backdrop-blur-xl p-8 transition-all duration-500 hover:border-gold-subtle hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer"
              >
                {/* CORNER GLOW EFFECT */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C5A880]/10 via-[#C5A880]/3 to-transparent rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute -inset-px bg-gradient-to-r from-transparent via-[#C5A880]/0 to-[#C5A880]/0 rounded-2xl group-hover:via-[#C5A880]/15 group-hover:to-[#C5A880]/5 transition-all duration-700 pointer-events-none" />

                {/* ICON */}
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-warm-gold border border-white-subtle group-hover:bg-[#C5A880]/10 group-hover:text-white transition-all duration-300">
                  <Icon size={22} className="stroke-[1.5] transition-transform duration-500 group-hover:scale-110" />
                </div>

                {/* BADGE */}
                <span className="block text-[9px] uppercase tracking-widest text-soft-cream/70 font-bold mb-2">
                  {service.badge}
                </span>

                {/* TITLE */}
                <h3 className="text-xl font-bold text-ivory group-hover:text-warm-gold transition-colors duration-300 mb-3">
                  {service.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-sm leading-relaxed text-warm-silk/80 font-light group-hover:text-ivory transition-colors duration-300">
                  {service.description}
                </p>

                {/* READ MORE INDICATOR */}
                <div className="mt-8 flex items-center gap-1.5 text-xs text-warm-gold font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <span>Explore Specialties</span>
                  <span className="text-sm">→</span>
                </div>

              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}