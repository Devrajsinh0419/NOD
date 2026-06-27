"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section id="contact" className="relative py-36 bg-elevation-0 overflow-hidden px-4 md:px-8">
      
      {/* GLOWING AMBIENT BACKGROUNDS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-tr from-[#C5A880]/8 via-orange-500/5 to-transparent blur-[140px]" 
        />
        <div className="absolute inset-0 bg-[#161618]/30 backdrop-blur-[1px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* BANNER FRAME */}
        <div className="rounded-[3rem] border border-white-subtle bg-elevation-2/95 backdrop-blur-2xl p-12 md:p-24 text-center shadow-2xl relative overflow-hidden">
          
          {/* Subtle grid lines background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#C5A88006_1px,transparent_1px),linear-gradient(to_bottom,#C5A88006_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
          
          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gold-subtle bg-[#C5A880]/5 text-[10px] font-bold text-warm-gold uppercase tracking-wider mb-8"
          >
            <Sparkles size={10} />
            <span>Launch Your Vision</span>
          </motion.div>

          {/* Heading */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-extrabold text-ivory leading-none mb-6 tracking-tight font-sans"
          >
            Ready to Build Something<br />
            <span className="bg-gradient-to-r from-warm-gold via-[#EAE5DB] to-ivory bg-clip-text text-transparent">
              Extraordinary?
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-xl text-base text-warm-silk font-light leading-relaxed mb-12 opacity-90"
          >
            Join elite property owners and top design agencies. Post your brief for free and connect with certified architectural professionals today.
          </motion.p>

          {/* Two Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login?mode=signup" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-warm-gold to-[#A3865D] px-8 py-4 text-sm font-bold text-[#161618] transition-all duration-300 hover:shadow-[0_0_30px_rgba(197,168,128,0.4)] hover:scale-[1.02] cursor-pointer">
                <span>Start Your Project</span>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>

            <Link href="/login?mode=signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white-subtle bg-white/5 hover:bg-white/10 px-8 py-4 text-sm font-bold text-ivory transition-all duration-300 hover:border-white-subtle-20 cursor-pointer">
                Become a Professional
              </button>
            </Link>
          </motion.div>

        </div>

      </div>
    </section>
  )
}