"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

function Counter({ value, suffix = "", prefix = "", duration = 2 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const end = value
    const totalSteps = 60
    const stepTime = (duration * 1000) / totalSteps
    const increment = Math.ceil(end / totalSteps)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [isInView, value, duration])

  // Format count with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-IN")
  }

  return (
    <span ref={ref} className="font-mono text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-warm-gold">
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  )
}

export default function Statistics() {
  const stats = [
    {
      value: 500,
      suffix: "+",
      label: "Projects Completed",
      desc: "High-end residential villas, penthouses, and commercial renovations.",
    },
    {
      value: 20,
      suffix: "+",
      label: "Vetted Professionals",
      desc: "Top interior designers, registered architects, and structural engineers.",
    },
    {
      value: 10,
      prefix: "₹",
      suffix: "M+",
      label: "Project Value Managed",
      desc: "Protecting client investments and payments through secure milestones.",
    },
    {
      value: 98,
      suffix: "%",
      label: "Client Satisfaction",
      desc: "Based on final site inspections and client handover signatures.",
    },
  ]

  return (
    <section id="statistics" className="relative py-36 bg-elevation-1 overflow-hidden px-4 md:px-8">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[50%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#C5A880]/2 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="rounded-[2.5rem] border border-white-subtle bg-elevation-2/95 backdrop-blur-2xl p-8 md:p-16 shadow-2xl relative">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white-subtle">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center lg:items-start text-center lg:text-left ${
                  index > 0 ? "pt-8 lg:pt-0 lg:pl-8" : ""
                }`}
              >
                {/* Counter Animation */}
                <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                
                {/* Stat Title */}
                <h3 className="text-base font-bold text-ivory mt-4 mb-2 tracking-wide font-sans">
                  {stat.label}
                </h3>
                
                {/* Description */}
                <p className="text-xs leading-relaxed text-soft-cream font-light max-w-xs opacity-90">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
