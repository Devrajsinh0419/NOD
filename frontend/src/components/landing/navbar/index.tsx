"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import logo from "@/public/images/logo.png"
import { Menu, X, ArrowRight } from "lucide-react"
import { authService } from "@/services/auth.service"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar({ session: serverSession }: { session?: any }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setCurrentUser(authService.getStoredUser())

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    setCurrentUser(null)
    setMobileMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
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

  const navLinks = [
    { label: "Designers", target: "designers" },
    { label: "Projects", target: "projects" },
    { label: "Services", target: "services" },
    { label: "Pricing", target: "pricing" },
    { label: "About", target: "about" },
    { label: "Contact", target: "contact" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
        isScrolled || mobileMenuOpen
          ? "bg-[#0b0a0a]/80 backdrop-blur-xl border-b border-[#C9A96E]/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4 md:py-5">
        
        {/* LOGO */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#C9A96E]/20 transition-transform duration-500 group-hover:rotate-12">
            <Image
              src={logo}
              alt="Night Owl Designers (NOD) Logo"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col leading-none">
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#C9A96E] transition-colors duration-300">
                N<span className="text-[#C9A96E]">OD</span>
              </span>
            </div>
            <span className="text-[8px] tracking-[0.25em] text-[#B8A382]/60 font-semibold uppercase mt-0.5">
              Night Owl Designers
            </span>
          </div>
        </div>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={`#${link.target}`}
              onClick={(e) => handleNavClick(e, link.target)}
              onMouseEnter={() => setHoveredLink(link.label)}
              onMouseLeave={() => setHoveredLink(null)}
              className="relative px-4 py-2 text-sm font-medium text-[#F5F0E8]/85 hover:text-[#C9A96E] transition-colors duration-300 rounded-full"
            >
              {hoveredLink === link.label && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-0 bg-[#C9A96E]/5 rounded-full border border-[#C9A96E]/10 -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {link.label}
            </a>
          ))}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#B8A382] font-light max-w-[150px] truncate">
                Logged in as <strong className="text-[#C9A96E] font-medium">{currentUser.email}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[#F5F0E8] hover:text-[#C9A96E] transition-colors duration-300"
              >
                Login
              </Link>
              <Link href="/login?mode=signup">
                <button className="group relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#C9A96E] to-[#B8944F] px-5 py-2 text-xs font-semibold text-[#0D0D0D] transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,169,110,0.3)] hover:scale-[1.02] cursor-pointer">
                  <span>Get Started</span>
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-center p-2 text-[#F5F0E8] hover:text-[#C9A96E] transition-colors md:hidden border border-white/5 bg-white/5 rounded-full"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full bg-[#0d0d0d]/95 backdrop-blur-2xl border-b border-[#C9A96E]/15 overflow-hidden md:hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={`#${link.target}`}
                    onClick={(e) => handleNavClick(e, link.target)}
                    className="text-[#F5F0E8]/90 hover:text-[#C9A96E] transition-colors py-2.5 text-sm font-medium border-b border-white/5 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={12} className="text-[#C9A96E]/40" />
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-[#C9A96E]/10 flex flex-col gap-3">
                {currentUser ? (
                  <>
                    <p className="text-xs text-[#B8A382] text-center truncate">
                      Logged in as <strong className="text-[#C9A96E]">{currentUser.email}</strong>
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center text-red-400 hover:text-white py-3 transition-colors text-sm font-medium border border-red-500/20 bg-red-500/5 rounded-full cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center text-[#F5F0E8] hover:text-[#C9A96E] py-3 transition-colors text-sm font-medium border border-white/10 rounded-full"
                    >
                      Login
                    </Link>
                    <Link
                      href="/login?mode=signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <button className="w-full rounded-full bg-gradient-to-r from-[#C9A96E] to-[#B8944F] py-3 text-sm font-semibold text-[#0D0D0D] transition-all hover:shadow-[0_0_20px_rgba(201,169,110,0.3)] cursor-pointer">
                        Get Started
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}