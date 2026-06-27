"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, CheckCircle2, IndianRupee, Calendar, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function DesignerShowcase() {
  const designers = [
    {
      name: "Kashish Shah",
      specialization: "Seasoned Projects Manager",
      location: "Hydrabad",
      rating: "4.9",
      projects: "10 Completed",
      rate: "600/hr",
      cover: "/images/interior.webp",
      avatar: "/images/h1.webp",
      badge: "Featured Expert",
    },
    {
      name: "Anvi Mittal",
      specialization: "Design Expert",
      location: "Delhi",
      rating: "4.85",
      projects: "10 Completed",
      rate: "700/hr",
      cover: "/images/exterior.webp",
      avatar: "/images/h3.webp",
      badge: "Featured Studio",
    },
    {
      name: "Ayushi Agrawal",
      specialization: "Interior Designer",
      location: "Madhya Pradesh",
      rating: "4.95",
      projects: "10 Completed",
      rate: "500/hr",
      cover: "/images/civil.webp",
      avatar: "/images/h4.webp",
      badge: "Top Contractor",
    },
  ]

  return (
    <section id="designers" className="relative py-36 bg-elevation-0 overflow-hidden px-4 md:px-8">

      {/* BACKGROUND GLOW */}
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A880]/3 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">

        {/* HEADING */}
        <div className="mb-20 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-warm-gold font-bold block mb-4">
            Curated Talent
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-ivory leading-tight font-sans">
            Elite Designer Showcase
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-warm-silk font-light opacity-90">
            Connect directly with award-winning creative minds and engineering studios vetted for high-end residential and commercial briefs.
          </p>
        </div>

        {/* PROFILES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {designers.map((designer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-3xl border border-white-subtle bg-elevation-2/95 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-gold-subtle"
            >

              {/* COVER IMAGE */}
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={designer.cover}
                  alt={`${designer.name} cover`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 380px"
                  loading="lazy"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Featured Badge */}
                <span className="absolute top-4 left-4 bg-warm-gold text-[#161618] text-[9px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  {designer.badge}
                </span>
              </div>

              {/* PROFILE INFO CONTAINER */}
              <div className="relative p-6 pt-10">

                {/* AVATAR (Overlapping cover) */}
                <div className="absolute -top-10 left-6 h-18 w-18 rounded-full overflow-hidden border-[3px] border-elevation-2 bg-elevation-2 shadow-xl">
                  <div className="relative h-full w-full rounded-full overflow-hidden border border-gold-subtle">
                    <Image
                      src={designer.avatar}
                      alt={designer.name}
                      fill
                      className="object-cover"
                      sizes="72px"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* VERIFIED INDICATOR */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <h3 className="text-xl font-bold text-ivory group-hover:text-warm-gold transition-colors duration-300 font-sans">
                    {designer.name}
                  </h3>
                  <CheckCircle2 size={15} className="text-warm-gold fill-[#161618] stroke-[2.5]" />
                </div>

                {/* Specialization */}
                <p className="text-xs text-warm-silk font-medium mb-5">{designer.specialization}</p>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-y-4 border-t border-white-subtle pt-4 mb-6">

                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-warm-gold/75 shrink-0" />
                    <span className="text-xs text-soft-cream">{designer.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star size={13} fill="var(--accent-gold)" className="text-warm-gold shrink-0" />
                    <span className="text-xs text-ivory font-medium">{designer.rating} <span className="text-cool-slate text-[10px] font-normal">(reviews)</span></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-warm-gold/75 shrink-0" />
                    <span className="text-xs text-soft-cream">{designer.projects}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IndianRupee size={13} className="text-warm-gold/75 shrink-0" />
                    <span className="text-xs text-ivory font-semibold">{designer.rate}</span>
                  </div>

                </div>

                {/* Hire / View Profile Button */}
                <Link href="/login?mode=signup" className="block w-full">
                  <button className="group/btn w-full flex items-center justify-center gap-1.5 rounded-xl border border-white-subtle hover:border-gold-subtle bg-white/5 hover:bg-[#C5A880]/5 py-3.5 text-xs font-bold text-ivory transition-all duration-300 cursor-pointer">
                    <span>Contact Professional</span>
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                  </button>
                </Link>

              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
