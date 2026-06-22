"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Link from "next/link"

import Image from "next/image"

export default function HeroSection() {

  const images = [
    "/images/hero1.png",
    "/images/hero2.png",
    "/images/hero3.png",
    "/images/hero4.png",
  ]

  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 5000) // change every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="static-dark bg-[#0D0D0D] relative flex min-h-screen items-center justify-center overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0"
              }`}
          >
            <Image
              src={image}
              alt={`Hero Slide ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 mx-auto max-w-4xl px-4 md:px-6 text-center"
      >
        <p className="mb-4 text-xs md:text-sm uppercase tracking-[0.3em] text-[#C9A96E]">
          Interior Design Marketplace
        </p>

        <h1 className="text-4xl font-bold leading-tight md:text-7xl text-[#F5F0E8]">
          Crafting Spaces
          <br />
          That <span className="text-[#C9A96E]">Inspire</span>
        </h1>

        <p className="mx-auto mt-4 md:mt-6 max-w-2xl text-base md:text-2xl leading-relaxed text-[#B8A88A]">
          Connecting visionary clients with world-class architects,
          designers, and interior professionals.
        </p>

        <div className="mt-8 md:mt-10 flex justify-center gap-4">
          <Link href="/login?mode=signup" >
            <button className="rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/10 px-6 py-3 md:px-10 md:py-5 text-sm text-[#D4C4A8] backdrop-blur-md transition-all duration-300 hover:bg-[#C9A96E]/25 hover:border-[#C9A96E]/50">
              Get A Quote
            </button>
          </Link>
        </div>
      </motion.div>

    </section>
  )
}