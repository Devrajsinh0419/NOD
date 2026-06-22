"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/images/logo.png"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    { label: "Services", href: "#services", isHash: true },
    { label: "Portfolio", href: "#projects", isHash: true },
    { label: "Tenders", href: "/tenders", isHash: false },
    { label: "Designers", href: "/public/marketplace/designers", isHash: false },
    { label: "Projects", href: "/public/marketplace/projects", isHash: false },
    { label: "About", href: "#about", isHash: true },
    { label: "Contact", href: "#contact", isHash: true },
  ]

  return (
    <header
      className={`static-dark fixed top-0 left-0 z-50 w-full transition-all duration-300 ${isScrolled || mobileMenuOpen
        ? "bg-black/80 backdrop-blur-md border-b border-[#C9A96E]/10 shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 relative z-10 ${isScrolled ? "py-3" : "py-5"
        }`}>
        <div className="flex items-center gap-2 md:gap-3">
          <Image
            src={logo}
            alt="Night Owl Designers (NOD) Logo"
            className="h-10 w-10 md:h-14 md:w-14"
            priority
          />

          <div className="flex items-center">
            <h1 className="text-3xl md:text-5xl font-bold leading-none text-[#F5F0E8]">N</h1>

            <div className="ml-1 leading-none">
              <p className="text-lg md:text-2xl font-semibold text-[#F5F0E8]">OD</p>
              <p className="hidden sm:block text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-[#F5F0E8]/70">
                IGHT OWL DESIGNERS
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Links */}
        <nav 
          className="hidden gap-6 lg:gap-8 md:flex text-[#F5F0E8] text-sm"
          onMouseLeave={() => setHoveredItem(null)}
        >
          {navLinks.map((link) => (
            link.isHash ? (
              <a
                key={link.label}
                href={link.href}
                className={`${getLinkClass(link.label)} hover:text-[#C9A96E] transition-colors cursor-pointer`}
                onMouseEnter={() => setHoveredItem(link.label)}
                onClick={(e) => handleNavClick(e, link.href.substring(1))}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={`${getLinkClass(link.label)} hover:text-[#C9A96E] transition-colors cursor-pointer`}
                onMouseEnter={() => setHoveredItem(link.label)}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Desktop Actions */}
        <div 
          className="hidden md:flex items-center gap-4"
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
            <button className="rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/10 px-5 py-2 text-sm text-[#C9A96E] backdrop-blur-md hover:bg-[#C9A96E]/20 transition-colors cursor-pointer" >
              Sign Up
            </button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-center p-2 text-[#F5F0E8] hover:text-[#C9A96E] transition-colors md:hidden"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 z-40 w-full bg-[#0D0D0D]/95 backdrop-blur-lg border-b border-[#C9A96E]/15 px-6 py-8 flex flex-col gap-6 md:hidden animate-fadeIn">
          <nav className="flex flex-col gap-4 text-[#F5F0E8] text-base">
            {navLinks.map((link) => (
              link.isHash ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-[#C9A96E] transition-colors py-2 border-b border-white/5"
                  onClick={(e) => {
                    handleNavClick(e, link.href.substring(1))
                    setMobileMenuOpen(false)
                  }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-[#C9A96E] transition-colors py-2 border-b border-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-[#C9A96E]/10">
            <Link
              href="/login?mode=signin"
              className="text-center text-[#F5F0E8] hover:text-[#C9A96E] py-2.5 transition-colors text-sm font-medium border border-white/10 rounded-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/login?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <button className="w-full rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/10 py-3 text-sm text-[#C9A96E] hover:bg-[#C9A96E]/20 transition-colors cursor-pointer">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}