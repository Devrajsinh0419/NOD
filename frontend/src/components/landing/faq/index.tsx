"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export default function FAQ() {
  const faqs = [
    {
      question: "How does the milestone payment system work?",
      answer: "To ensure a secure, fair, and seamless collaboration between clients and designers, NOD utilizes a secure Escrow Wallet system. All projects follow a strict payment and delivery milestone structure. Secure 70/30 Split: Work begins after a 70% advance deposit into the secure NOD wallet, with the remaining 30% paid upon final completion. Protected Previews: Clients can fully view and request revisions on designs through the platform, but downloads and screenshots are strictly blocked. The platform automatically unlocks all downloadable assets the moment the final 30% milestone payment is released.",
    },
    {
      question: "What vetting criteria do you apply to design professionals?",
      answer: "Every professional undergoes a comprehensive 3-step screening: verification of registration licenses (such as COA for architects), professional portfolio checks of physically executed sites, and reputation/credit audits.",
    },
    {
      question: "Can I find turn-key contractors as well as interior designers?",
      answer: "Yes, NOD is a comprehensive spatial marketplace. You can hire registered architects for layouts, interior designers for styling, MEP consultants, structural planners, and turn-key civil contractors for final execution.",
    },
    {
      question: "How are project timelines and disputes managed?",
      answer: "All collaborations are backed by legal-grade digital agreements specifying deliverables, milestones, and delays. In the rare event of a disagreement, our mediation team steps in to audit on-site completion against the contract specs.",
    },
    {
      question: "Is there a charge to post a project and receive bids?",
      answer: "No, posting a project and receiving initial bids is completely free. You only fund your milestone accounts once you finalize interviews and sign a contract with your selected professional.",
    },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="pricing" className="relative py-36 bg-elevation-0 overflow-hidden px-4 md:px-8">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/2 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        
        {/* HEADING */}
        <div className="mb-20 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-warm-gold font-bold block mb-4">
            Got Questions?
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ivory leading-tight font-sans">
            Frequently Asked Questions
          </h2>
        </div>

        {/* ACCORDION CONTAINER */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div 
                key={index}
                className="border-b border-white-subtle pb-4 last:border-b-0"
              >
                {/* Header button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between py-5 text-left text-ivory hover:text-warm-gold transition-colors duration-300 cursor-pointer group font-sans"
                >
                  <span className="text-base md:text-lg font-semibold tracking-wide">
                    {faq.question}
                  </span>
                  <div className={`h-8 w-8 rounded-full border border-white-subtle bg-white/5 flex items-center justify-center text-ivory/60 group-hover:text-warm-gold group-hover:border-gold-subtle transition-all duration-300 ${
                    isOpen ? "rotate-180 text-warm-gold border-gold-subtle" : ""
                  }`}>
                    <ChevronDown size={14} className="transition-transform duration-300" />
                  </div>
                </button>

                {/* Answer body collapsible */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm leading-relaxed text-soft-cream font-light pb-6 pt-1 max-w-3xl opacity-95">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
