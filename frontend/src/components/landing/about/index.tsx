"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Sparkles, Quote } from "lucide-react"

export default function AboutFounder() {
  return (
    <section id="about" className="relative py-36 bg-elevation-1 overflow-hidden px-4 md:px-8">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A880]/2 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="rounded-[2.5rem] border border-white-subtle bg-elevation-2/95 backdrop-blur-2xl p-8 md:p-12 shadow-2xl relative">
          
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Image (Founder) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative h-[320px] w-[260px] md:h-[420px] md:w-[320px] overflow-hidden rounded-[2rem] border border-white-subtle shrink-0 shadow-2xl"
            >
              <Image
                src="/images/founder.webp"
                alt="Govind Shukla - Founder of Night Owl Designers (NOD)"
                fill
                className="object-cover scale-105"
                sizes="(max-width: 768px) 100vw, 320px"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>

            {/* Philosophy Text */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex-1 text-center lg:text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gold-subtle bg-[#C5A880]/5 text-[10px] font-bold text-warm-gold uppercase tracking-wider mb-6">
                <Sparkles size={10} />
                <span>Founder's Philosophy</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-ivory leading-tight mb-8 font-sans">
                Govind Shukla
              </h2>

              <div className="relative">
                {/* Large quote marks in background */}
                <div className="absolute -top-6 -left-4 text-warm-gold/10 pointer-events-none">
                  <Quote size={60} className="fill-current rotate-180" />
                </div>
                
                <p className="text-lg md:text-2xl leading-relaxed text-warm-silk font-light italic pl-8 mb-8">
                  “Nothing of true value comes free. We build spaces through absolute mathematical precision, artistic dedication, and timeless structural craftsmanship.”
                </p>
              </div>

              <p className="text-sm leading-relaxed text-soft-cream font-light max-w-xl opacity-90">
                Night Owl Designers was built to bridge the gap between discerning property owners and the elite design studios capable of executing their plans. We eliminate on-site project leaks, design errors, and payment uncertainty, providing a secure workspace for India's spatial masterpieces.
              </p>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  )
}