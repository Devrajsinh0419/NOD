"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, CheckCircle2, MessageSquare, Clock, MapPin, Sparkles, Shield, ArrowRight } from "lucide-react"

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="min-h-screen bg-[#161618]" />

  // Floating animation settings for cards
  const floatAnimation = (delay: number, duration: number = 5, yDist: number = 12) => ({
    animate: {
      y: [0, -yDist, 0],
    },
    transition: {
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: delay
    }
  })


  const scrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  return (
    <section className="relative min-h-screen bg-elevation-0 overflow-hidden flex items-center justify-center pt-32 pb-24 px-4 md:px-8">

      {/* BACKGROUND GLOWS AND EFFECTS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle radial gradient */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#C5A880]/6 via-amber-500/2 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-orange-500/3 via-[#C5A880]/4 to-transparent blur-[150px] animate-pulse" style={{ animationDuration: "18s" }} />

        {/* Fine Noise grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* HERO CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 flex flex-col items-start text-left"
        >


          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[76px] font-extrabold text-ivory tracking-tight leading-[1.05] mb-6 font-sans">
            Design Spaces<br />
            <span className="bg-gradient-to-r from-warm-gold via-[#EAE5DB] to-ivory bg-clip-text text-transparent">
              That Inspire.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-warm-silk font-light leading-relaxed max-w-xl mb-10 opacity-90">
            Hire verified, award-winning professionals for high-end interior design, architecture, structural planning, and premium renovations across India.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
            <Link href="/login?mode=signup" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-warm-gold to-[#A3865D] px-8 py-4 text-sm font-bold text-[#161618] transition-all duration-300 hover:shadow-[0_0_30px_rgba(197,168,128,0.4)] hover:scale-[1.03] cursor-pointer">
                <span>Start Your Project</span>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
            <button
              onClick={() => scrollToSection("designers")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white-subtle bg-white/5 hover:bg-white/10 px-8 py-4 text-sm font-bold text-ivory transition-all duration-300 hover:border-white-subtle-20 cursor-pointer"
            >
              Browse Professionals
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-white-subtle w-full">
            <div className="flex items-center gap-2">
              <div className="flex text-warm-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" className="text-warm-gold" />
                ))}
              </div>
              <span className="text-xs text-warm-silk font-medium tracking-wide">500+ Projects Completed</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-warm-gold" />
              <span className="text-xs text-warm-silk font-medium tracking-wide">Verified Experts Only</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-warm-gold" />
              <span className="text-xs text-warm-silk font-medium tracking-wide">Secure Milestone Payments</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT FLOATING INTERFACE */}
        <div className="lg:col-span-6 relative h-[550px] md:h-[650px] w-full flex items-center justify-center">

          {/* Main Decorative Blur Background */}
          <div className="absolute inset-0 bg-[#C5A880]/5 rounded-3xl border border-white-subtle backdrop-blur-[2px] pointer-events-none -z-10 shadow-[inset_0_0_50px_rgba(197,168,128,0.03)]" />

          {/* CARD 1: DESIGNER PROFILE */}
          <motion.div
            {...floatAnimation(0.2, 5.2, 10)}
            className="absolute top-[8%] left-[5%] md:left-[10%] w-[240px] rounded-2xl border border-white-subtle bg-elevation-2/95 backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gold-subtle">
                <Image src="/images/h1.webp" fill alt="Kashish Shah" className="object-cover scale-110" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-ivory">Kashish Shah</h4>
                <p className="text-[10px] text-soft-cream">Seasoned Project Manager</p>
              </div>
              <div className="ml-auto flex items-center gap-1 bg-[#C5A880]/10 border border-[#C5A880]/20 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                <span className="text-[8px] text-warm-gold font-bold uppercase">Active</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] border-t border-white-subtle pt-2 text-soft-cream">
              <span>★ 4.9 (124 reviews)</span>
              <span className="text-warm-gold font-medium">₹2,500/hr</span>
            </div>
          </motion.div>

          {/* CARD 2: INTERIOR PROJECT PREVIEW */}
          <motion.div
            {...floatAnimation(1.2, 5.8, 14)}
            className="absolute top-[22%] right-[5%] md:right-[10%] w-[280px] rounded-2xl border border-white-subtle bg-elevation-2/95 backdrop-blur-xl p-3 shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-10 overflow-hidden group"
          >
            <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3">
              <Image
                src="/images/interior.webp"
                fill
                alt="Penthouse"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-warm-gold font-medium border border-white-subtle">
                Lounge Design
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-ivory">Amber Lounge Suite</h4>
                <p className="text-[10px] text-soft-cream mt-0.5">By Vikram Malhotra</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-warm-gold block font-semibold">₹4.8M Budget</span>
                <span className="text-[8px] text-green-400">Completed</span>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: BUDGET BREAKDOWN */}
          <motion.div
            {...floatAnimation(2.0, 4.8, 8)}
            className="absolute bottom-[28%] left-[2%] md:left-[5%] w-[220px] rounded-2xl border border-white-subtle bg-elevation-2/95 backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20"
          >
            <h5 className="text-[10px] font-semibold text-soft-cream uppercase tracking-wider mb-2">Project Estimate</h5>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-bold text-ivory">₹8,500,000</span>
              <span className="text-[9px] text-green-400 font-medium">Within target</span>
            </div>

            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-[8px] text-soft-cream mb-0.5">
                  <span>Architecture & Design</span>
                  <span>40%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-warm-gold rounded-full" style={{ width: "40%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] text-soft-cream mb-0.5">
                  <span>Materials & Sourcing</span>
                  <span>45%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] text-soft-cream mb-0.5">
                  <span>Execution & Labor</span>
                  <span>15%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-warm-silk/70 rounded-full" style={{ width: "15%" }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 4: RECENT MESSAGE CHAT */}
          <motion.div
            {...floatAnimation(0.8, 6.2, 12)}
            className="absolute bottom-[8%] right-[8%] md:right-[12%] w-[260px] rounded-2xl border border-white-subtle bg-elevation-2/95 backdrop-blur-xl p-3 shadow-[0_30px_60px_rgba(0,0,0,0.7)] z-30"
          >
            <div className="flex items-start gap-2.5">
              <div className="relative h-6 w-6 rounded-full overflow-hidden shrink-0 border border-white-subtle mt-0.5">
                <Image src="/images/h2.webp" fill alt="Yash Kumar Sen" className="object-cover" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-ivory">Yash Kumar Sen</span>
                  <span className="text-[8px] text-soft-cream">Civil Engineer</span>
                </div>
                <p className="text-[10px] leading-relaxed text-warm-silk opacity-95">
                  "The copper accent cladding samples for the master bedroom ceiling have arrived. Preparing rendering for review."
                </p>
                <div className="flex items-center gap-1 text-[8px] text-warm-gold font-medium pt-1">
                  <MessageSquare size={8} />
                  <span>Tap to join review call</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 5: PROJECT TIMELINE / MILESTONES */}
          <motion.div
            {...floatAnimation(2.5, 5.0, 9)}
            className="absolute bottom-[46%] right-[2%] w-[170px] rounded-xl border border-white-subtle bg-elevation-2/95 backdrop-blur-md p-3 shadow-[0_15px_40px_rgba(0,0,0,0.4)] z-0"
          >
            <div className="flex items-center gap-1.5 text-soft-cream mb-2">
              <Clock size={10} className="text-warm-gold" />
              <span className="text-[9px] font-semibold uppercase tracking-wider">Milestones</span>
            </div>
            <div className="space-y-2 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
              <div className="flex items-center gap-2 pl-3 relative">
                <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[9px] text-warm-silk">3D Renderings approved</span>
              </div>
              <div className="flex items-center gap-2 pl-3 relative">
                <span className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-warm-gold animate-pulse" />
                <span className="text-[9px] text-warm-gold font-semibold">Material selection</span>
              </div>
              <div className="flex items-center gap-2 pl-3 relative opacity-40">
                <span className="absolute left-[3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[9px] text-warm-silk">Site execution</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}