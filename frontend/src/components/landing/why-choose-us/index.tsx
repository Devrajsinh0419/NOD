"use client"

import Image from "next/image"
import { Check, ShieldCheck, Cpu, MessageSquare, Briefcase, CreditCard, Sparkles, Award } from "lucide-react"
import { motion } from "framer-motion"

export default function WhyChooseUs() {
  const clientChecklist = [
    { title: "Verified Professionals", desc: "Every designer undergoes a rigorous portfolio and credentials audit.", icon: ShieldCheck },
    { title: "AI-Powered Matching", desc: "Get matched with the perfect experts based on style, budget, and scope.", icon: Cpu },
    { title: "Project Tracking", desc: "Track blueprints, milestone approvals, and site work in real time.", icon: Sparkles },
    { title: "Secure Payments", desc: "Funds are released only when you approve the completed milestone.", icon: CreditCard },
  ]

  const professionalChecklist = [
    { title: "Milestone Contracts", desc: "Work with absolute confidence under clear, legally binding terms.", icon: Briefcase },
    { title: "Live Client Chat", desc: "Collaborate directly with clients with integrated media sharing.", icon: MessageSquare },
    { title: "Portfolio Reviews", desc: "Get structural and interior portfolios reviewed by top industry veterans.", icon: Award },
    { title: "Elite Ratings System", desc: "Earn premium trust score badges that put your profile at the top.", icon: ShieldCheck },
  ]

  return (
    <section id="why-choose" className="relative py-36 bg-elevation-0 overflow-hidden px-4 md:px-8">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A880]/2 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* BLOCK 1: CLIENT FOCUS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* IMAGE LEFT */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden border border-white-subtle"
          >
            <Image 
              src="/images/project.webp" 
              fill 
              alt="Architectural Consultation Session" 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              loading="lazy"
            />
            {/* Dark glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Absolute badge overlay */}
            <div className="absolute bottom-6 left-6 bg-elevation-2/90 backdrop-blur-md border border-gold-subtle p-4 rounded-2xl max-w-xs">
              <span className="text-[10px] text-warm-gold font-bold uppercase tracking-wider block mb-1">Elite Quality Guarantee</span>
              <p className="text-xs text-warm-silk font-light">Only 3% of applicants pass our technical portfolio vetting process.</p>
            </div>
          </motion.div>

          {/* TEXT RIGHT */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            <span className="text-xs uppercase tracking-[0.25em] text-warm-gold font-bold mb-4">
              For Visionary Clients
            </span>
            
            <h2 className="text-3xl md:text-5xl font-extrabold text-ivory leading-tight mb-6 font-sans">
              A Flawless Spatial Design Delivery.
            </h2>
            
            <p className="text-base text-warm-silk font-light leading-relaxed mb-10 opacity-90">
              We connect you with highly vetted design studios and specialists capable of executing high-end projects under absolute cost and quality control.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {clientChecklist.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex gap-3">
                    <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-[#C5A880]/10 border border-gold-subtle flex items-center justify-center text-warm-gold">
                      <Check size={11} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ivory flex items-center gap-1.5 font-sans">
                        <Icon size={12} className="text-warm-gold/80" />
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-[11px] text-soft-cream mt-1 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

        </div>

        {/* BLOCK 2: PROFESSIONAL FOCUS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* TEXT LEFT */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 order-2 lg:order-1 flex flex-col items-start"
          >
            <span className="text-xs uppercase tracking-[0.25em] text-warm-gold font-bold mb-4">
              For Design Professionals
            </span>
            
            <h2 className="text-3xl md:text-5xl font-extrabold text-ivory leading-tight mb-6 font-sans">
              Grow Your Signature Practice.
            </h2>
            
            <p className="text-base text-warm-silk font-light leading-relaxed mb-10 opacity-90">
              Access high-value private commissions, verified contractors, and structural engineers. Run client relationships through milestone protection.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {professionalChecklist.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex gap-3">
                    <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-[#C5A880]/10 border border-gold-subtle flex items-center justify-center text-warm-gold">
                      <Check size={11} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ivory flex items-center gap-1.5 font-sans">
                        <Icon size={12} className="text-warm-gold/80" />
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-[11px] text-soft-cream mt-1 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* IMAGE RIGHT */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 order-1 lg:order-2 relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden border border-white-subtle"
          >
            <Image 
              src="/images/civil.webp" 
              fill 
              alt="Site Construction Monitoring" 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              loading="lazy"
            />
            {/* Dark glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Absolute badge overlay */}
            <div className="absolute bottom-6 right-6 bg-elevation-2/90 backdrop-blur-md border border-gold-subtle p-4 rounded-2xl max-w-xs text-right">
              <span className="text-[10px] text-warm-gold font-bold uppercase tracking-wider block mb-1">Corporate & Tenders</span>
              <p className="text-xs text-warm-silk font-light">Direct dashboard access to large commercial fit-outs and state tender bids.</p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
