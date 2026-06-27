"use client"

import { motion } from "framer-motion"
import { ClipboardList, MailOpen, Award, Users, CheckCircle, Star } from "lucide-react"

export default function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Post Your Project",
      description: "Submit details about your space, dimensions, and approximate budget. Our system categorizes it for top matches.",
      icon: ClipboardList,
    },
    {
      number: "02",
      title: "Receive Curated Bids",
      description: "Verified design studios and freelancers review details and submit structured cost proposals and conceptual approaches.",
      icon: MailOpen,
    },
    {
      number: "03",
      title: "Hire Your Expert",
      description: "Review matching portfolios, conduct interviews, and secure your choice via NOD's safe milestone-backed contracts.",
      icon: Award,
    },
    {
      number: "04",
      title: "Collaborate Seamlessly",
      description: "Approve 3D models, coordinate material boards, and trace on-site fit-out execution in your personal client workspace.",
      icon: Users,
    },
    {
      number: "05",
      title: "Approve & Complete",
      description: "Inspect finished rooms and site structural details. Approve final milestones to release the remaining secure funds.",
      icon: CheckCircle,
    },
    {
      number: "06",
      title: "Leave Your Review",
      description: "Share photos of your new spaces, rate your professional.",
      icon: Star,
    },
  ]

  return (
    <section id="process" className="relative py-36 bg-elevation-1 overflow-hidden px-4 md:px-8">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/2 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* HEADING */}
        <div className="mb-24 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-warm-gold font-bold block mb-4">
            The Journey
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-ivory leading-tight font-sans">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-warm-silk font-light opacity-90">
            A simple, secure, and professional path to translating your spatial blueprints into high-end architectural reality.
          </p>
        </div>

        {/* TIMELINE PATH */}
        <div className="relative mt-20 before:absolute before:left-4 md:before:left-1/2 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-warm-gold/40 before:via-warm-gold/10 before:to-warm-gold/40">
          
          {steps.map((step, index) => {
            const Icon = step.icon
            const isEven = index % 2 === 0

            return (
              <div 
                key={index} 
                className={`relative flex flex-col md:flex-row items-start md:items-center justify-between mb-16 md:mb-20 last:mb-0 w-full ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                
                {/* Timeline node dot */}
                <div className="absolute left-[9px] md:left-1/2 md:-translate-x-1/2 top-4 md:top-auto h-4.5 w-4.5 rounded-full border-[3px] border-elevation-1 bg-warm-gold shadow-[0_0_15px_rgba(197,168,128,0.8)] z-10" />

                {/* Left/Right content card */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
                  className="w-full md:w-[45%] pl-10 md:pl-0"
                >
                  <div className="group relative rounded-2xl border border-white-subtle bg-elevation-2/95 backdrop-blur-xl p-8 hover:border-gold-subtle transition-all duration-300 shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
                    
                    {/* Header: Step & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-warm-gold border border-white-subtle group-hover:bg-[#C5A880]/10 group-hover:text-white transition-all duration-300">
                        <Icon size={18} className="stroke-[1.5]" />
                      </div>
                      <span className="text-3xl font-extrabold text-soft-cream/20 font-mono tracking-tighter">
                        {step.number}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-ivory mb-3 group-hover:text-warm-gold transition-colors duration-300 font-sans">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-warm-silk/80 font-light">
                      {step.description}
                    </p>

                  </div>
                </motion.div>

                {/* Empty block to align items on desktop */}
                <div className="hidden md:block w-[45%]" />

              </div>
            )
          })}

        </div>

      </div>
    </section>
  )
}