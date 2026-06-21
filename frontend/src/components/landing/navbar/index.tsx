"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/images/logo.png"


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getLinkClass = (id: string) => {
    const isAnyHovered = hoveredItem !== null
    const isSelfHovered = hoveredItem === id
    return `transition-all duration-300 ${
      isAnyHovered && !isSelfHovered
        ? "opacity-30 blur-[0.5px]"
        : "opacity-100"
    }`
  }

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
    // { label: "Home", targetId: "home" },
    { label: "Services", targetId: "services" },
    { label: "Portfolio", targetId: "projects" },
    { label: "About", targetId: "about" },
    { label: "Contact", targetId: "contact" },
  ]

  return (
    <header
      className={`static-dark fixed top-0 left-0 z-50 w-full transition-all duration-300 ${isScrolled
        ? "bg-black/40 backdrop-blur-md border-b border-[#C9A96E]/10 shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 relative z-10 ${isScrolled ? "py-3" : "py-5"
        }`}>
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Logo"
            className="h-14 w-14"
          />

          <div className="flex items-center">
            <h1 className="text-7xl font-bold leading-none text-[#F5F0E8]">N</h1>

            <div className="ml-1 leading-none">
              <p className="text-3xl font-semibold text-[#F5F0E8]">OD</p>
              <p className="text-xs tracking-[0.3em] text-[#F5F0E8]">
                IGHT OWL DESIGNERS
              </p>
            </div>
          </div>
        </div>

        <nav 
          className="hidden gap-8 md:flex text-[#F5F0E8] text-sm"
          onMouseLeave={() => setHoveredItem(null)}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={`#${link.targetId}`}
              className={`${getLinkClass(link.label)} hover:text-[#C9A96E] transition-colors cursor-pointer`}
              onMouseEnter={() => setHoveredItem(link.label)}
              onClick={(e) => handleNavClick(e, link.targetId)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div 
          className="flex items-center gap-4"
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href="/login?mode=signin"
            className={`${getLinkClass("login")} text-[#F5F0E8] hover:text-[#C9A96E] transition-colors text-sm`}
            onMouseEnter={() => setHoveredItem("login")}
          >
            Login
          </Link>
          <Link
            href="/login?mode=signup"
            className={getLinkClass("signup")}
            onMouseEnter={() => setHoveredItem("signup")}
          >
            <button className="rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/10 px-5 py-2 text-sm text-[#C9A96E] backdrop-blur-md hover:bg-[#C9A96E]/20 transition-colors" >
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}