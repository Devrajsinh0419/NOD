"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Aditya Goenka",
      role: "Verified Owner, L'Aura Villa",
      quote: "Finding Vikram through NOD was a revelation. The platform's milestone payment structure gave us total peace of mind, and the results exceeded our loftiest expectations. The design feels timeless.",
      avatar: "/images/founder.webp",
      project: "Modern Villa, Alibaug",
    },
    {
      name: "Meera Singhania",
      role: "Managing Director, Singhania Group",
      quote: "For our corporate headquarters in Gurugram, we needed an architect who understood spatial flow and sustainable building standards. The matching system paired us with the perfect studio.",
      avatar: "/images/founder.webp",
      project: "Commercial HQ, Gurugram",
    },
    {
      name: "Dr. Shashi Shekhar",
      role: "Residential client",
      quote: "The level of execution and transparency is unprecedented. I could trace our residential renovation progress directly on the checklist, ensuring everything stayed within schedule and budget.",
      avatar: "/images/founder.webp",
      project: "Bungalow Refit, Chandigarh",
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" className="relative py-36 bg-elevation-0 overflow-hidden px-4 md:px-8">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#C5A880]/3 via-orange-500/1 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        
        {/* HEADING */}
        <div className="mb-16 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-warm-gold font-bold block mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-ivory leading-tight font-sans">
            Client Reflections
          </h2>
        </div>

        {/* SLIDING BOX */}
        <div className="relative min-h-[380px] md:min-h-[320px] flex items-center justify-center">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.45 }}
              className="w-full rounded-[2.5rem] border border-white-subtle bg-elevation-2/95 backdrop-blur-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              
              {/* Backquote outline icon */}
              <div className="absolute -top-6 -right-6 text-warm-gold/5 pointer-events-none">
                <Quote size={200} className="stroke-[0.5]" />
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                
                {/* Client Avatar & Name */}
                <div className="flex flex-col items-center text-center shrink-0 w-full md:w-56 border-b md:border-b-0 md:border-r border-white-subtle pb-6 md:pb-0 md:pr-8">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-gold-subtle mb-4">
                    <Image
                      src={testimonials[activeIndex].avatar}
                      alt={testimonials[activeIndex].name}
                      fill
                      className="object-cover scale-110"
                      sizes="80px"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="flex items-center gap-1 mb-1 justify-center">
                    <h3 className="text-lg font-bold text-ivory leading-none font-sans">
                      {testimonials[activeIndex].name}
                    </h3>
                    <CheckCircle2 size={13} fill="var(--accent-gold)" className="text-[#161618] stroke-[2]" />
                  </div>
                  <p className="text-[10px] text-warm-gold font-semibold uppercase tracking-wider mb-2">
                    {testimonials[activeIndex].role}
                  </p>
                  <span className="text-[9px] text-cool-slate border border-white-subtle bg-white/5 px-2 py-0.5 rounded-full">
                    {testimonials[activeIndex].project}
                  </span>
                </div>

                {/* Testimonial Quote */}
                <div className="flex-1 text-center md:text-left">
                  <div className="text-warm-gold mb-4 flex justify-center md:justify-start">
                    <Quote size={28} className="fill-current rotate-180" />
                  </div>
                  <p className="text-lg md:text-2xl leading-relaxed text-ivory/95 font-light italic">
                    "{testimonials[activeIndex].quote}"
                  </p>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

          {/* LEFT/RIGHT ARROWS */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            <button
              onClick={handlePrev}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-white-subtle bg-white/5 text-ivory hover:bg-[#C5A880]/10 hover:border-gold-subtle transition-all duration-300 cursor-pointer"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="h-10 w-10 flex items-center justify-center rounded-full border border-white-subtle bg-white/5 text-ivory hover:bg-[#C5A880]/10 hover:border-gold-subtle transition-all duration-300 cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}
