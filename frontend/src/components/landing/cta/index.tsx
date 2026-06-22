"use client"

import Image from "next/image"
import Link from "next/link"
import { FaInstagram, FaFacebook } from "react-icons/fa"
import logo from "@/public/images/logo.png"

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
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
  }
    const navLinks = [
    { label: "Home", targetId: "home" },
    { label: "Services", targetId: "services" },
    { label: "Projects", targetId: "projects" },
    { label: "About", targetId: "about" },
    { label: "Contact", targetId: "contact" },
  ]

export default function CTASection() {
  return (
    <section id="contact" className="pt-12 md:pt-24 px-4 md:px-6">

      {/* CTA BANNER */}
      <div className="static-dark relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#1A1714] border border-[#C9A96E]/10 py-16 md:py-24 px-6 md:px-12">

        {/* BACKGROUND IMAGE */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cta-bg.jpg"
            alt="CTA Background"
            fill
            className="object-cover opacity-45"
          />
          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">

          <h2 className="text-3xl font-light text-[#F5F0E8] md:text-6xl max-w-3xl leading-tight">
            Ready to Build Your Vision?
          </h2>

          <p className="mt-6 max-w-2xl text-base md:text-lg text-[#B8A88A] leading-relaxed">
            Luxury architectural and interior solutions crafted
            with precision, innovation, and timeless aesthetics.
          </p>
          <Link href="/login?mode=signup">
            <button className="mt-8 md:mt-10 rounded-full bg-linear-to-r from-[#C9A96E] to-[#B8944F] px-8 py-4 text-sm font-medium text-[#0D0D0D] transition-all duration-300 hover:scale-105 shadow-[0_0_25px_rgba(201,169,110,0.2)]">
              Get in Touch
            </button>
          </Link>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-[#C9A96E]/8 px-4 md:px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">

          {/* LEFT */}
          <div>

            <div className="flex items-center gap-4">

              <Image
                src={logo}
                alt="Logo"
                width={55}
                height={55}
                className="rounded-full"
              />

              <h3 className="text-lg text-[#F5F0E8]">
                Night Owl Designers
              </h3>

            </div>

            <p className="mt-8 max-w-sm text-sm leading-relaxed text-[#8B7355]">
              Crafting modern architectural and interior
              experiences across India.
            </p>

          </div>

          {/* CENTER */}
          <div className="text-left md:text-center">

            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#8B7355]">
              Quick Links
            </p>
            <nav className="flex flex-col gap-4 text-[#B8A88A]">
              {navLinks.map((link) => (
            <a
              key={link.label}
              href={`#${link.targetId}`}
              onClick={(e) => handleNavClick(e, link.targetId)}
            > 
              {link.label}
            </a>
          ))}
            </nav>

          </div>

          {/* RIGHT */}
          <div className="text-left md:text-right">

            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#8B7355]">
              Support
            </p>

            <div className="space-y-4 text-[#B8A88A]">

              <p>nightowldesignershelp@gmail.com</p>

              <p>+91 98752 78062</p>

              <p>Betul, Madhya Pradesh</p>

            </div>

            {/* SOCIALS */}
            <div className="mt-8 flex justify-start md:justify-end gap-4">
              <Link
                href="https://www.instagram.com/nod._india/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A96E]/15 bg-[#C9A96E]/5 text-[#C9A96E] transition-all duration-300 hover:bg-[#C9A96E]/15"
              >
                <FaInstagram size={18} />
              </Link>

              <Link
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A96E]/15 bg-[#C9A96E]/5 text-[#C9A96E] transition-all duration-300 hover:bg-[#C9A96E]/15"
              >
                <FaFacebook size={18} />
              </Link>
            </div>

          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-16 text-center text-xs text-[#6B5A42]">
          ©2026 All Rights Reserved by NOD India Pvt. Ltd.
        </div>

      </footer>

    </section>
  )
}