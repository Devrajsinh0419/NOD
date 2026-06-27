"use client"

import Link from "next/link"
import Image from "next/image"
import logo from "@/public/images/logo.png"
import { ArrowRight } from "lucide-react"

export default function Footer() {
    const marketplaceLinks = [
        { label: "Browse Designers", href: "#designers" },
        { label: "Browse Projects", href: "#projects" },
        { label: "Government Tenders", href: "/tenders" },
        { label: "Design Categories", href: "#services" },
    ]

    const professionalsLinks = [
        { label: "Join as Designer", href: "/login?mode=signup" },
        { label: "Join as Contracter", href: "/login?mode=signup" },
        { label: "Join as Architect", href: "/login?mode=signup" },
    ]

    const companyLinks = [
        { label: "About Us", href: "#about" },
        { label: "Why Choose NOD", href: "#why-choose" },
        { label: "Careers", href: "#" },
        { label: "Press Room", href: "#" },
    ]

    const legalLinks = [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Milestone Security", href: "#" },
        { label: "Trust & Safety", href: "#" },
    ]

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        if (targetId.startsWith("#")) {
            e.preventDefault()
            const element = document.getElementById(targetId.substring(1))
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

    return (
        <footer className="border-t border-white-subtle bg-elevation-0 pt-24 pb-12 px-6 md:px-8">
            <div className="mx-auto max-w-7xl">

                {/* TOP ROW: LOGO, DIRECTORY, NEWSLETTER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">

                    {/* Logo & Pitch */}
                    <div className="lg:col-span-4 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gold-subtle">
                                <Image src={logo} alt="NOD Logo" fill className="object-cover" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-bold tracking-tight text-ivory font-sans">
                                    N<span className="text-warm-gold">OD</span>
                                </span>
                                <span className="text-[9px] tracking-[0.25em] text-warm-silk/60 font-semibold uppercase mt-0.5">
                                    Night Owl Designers
                                </span>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed text-soft-cream max-w-xs mb-8 opacity-90">
                            India's premium marketplace matching visionary clients with elite architects, designers, and structural contractors.
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-3">
                            <Link
                                href="https://www.instagram.com/nod._india/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 w-10 flex items-center justify-center rounded-full border border-white-subtle bg-white/5 text-warm-silk hover:text-warm-gold hover:border-gold-subtle transition-all duration-300"
                                aria-label="Instagram"
                            >
                                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </Link>
                            <Link
                                href="https://www.linkedin.com/in/nod-india-9131b9400/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 w-10 flex items-center justify-center rounded-full border border-white-subtle bg-white/5 text-warm-silk hover:text-warm-gold hover:border-gold-subtle transition-all duration-300"
                                aria-label="LinkedIn"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                                </svg>
                            </Link>
                            <Link
                                href="https://x.com/NODIndia"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 w-10 flex items-center justify-center rounded-full border border-white-subtle bg-white/5 text-warm-silk hover:text-warm-gold hover:border-gold-subtle transition-all duration-300"
                                aria-label="Twitter"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Directory Links columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-8">

                        {/* Column 1 */}
                        <div>
                            <h4 className="text-[10px] font-bold text-ivory uppercase tracking-widest mb-4 font-sans">Marketplace</h4>
                            <ul className="space-y-3">
                                {marketplaceLinks.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            onClick={(e) => handleNavClick(e, link.href)}
                                            className="text-xs text-warm-silk/80 hover:text-warm-gold transition-colors duration-300"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <h4 className="text-[10px] font-bold text-ivory uppercase tracking-widest mb-4 font-sans">Professionals</h4>
                            <ul className="space-y-3">
                                {professionalsLinks.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            onClick={(e) => handleNavClick(e, link.href)}
                                            className="text-xs text-warm-silk/80 hover:text-warm-gold transition-colors duration-300"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div>
                            <h4 className="text-[10px] font-bold text-ivory uppercase tracking-widest mb-4 font-sans">Company</h4>
                            <ul className="space-y-3">
                                {companyLinks.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            onClick={(e) => handleNavClick(e, link.href)}
                                            className="text-xs text-warm-silk/80 hover:text-warm-gold transition-colors duration-300"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>


                        {/* Column 4 */}
                        <div>
                            <h4 className="text-[10px] font-bold text-ivory uppercase tracking-widest mb-4 font-sans">Legal</h4>
                            <ul className="space-y-3">
                                {legalLinks.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-xs text-warm-silk/80 hover:text-warm-gold transition-colors duration-300"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                </div>

                {/* BOTTOM NEWSLETTER & COPYRIGHT */}
                <div className="border-t border-white-subtle pt-12 flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Newsletter Input */}
                    <div className="w-full md:w-auto flex flex-col items-start gap-3">

                        <span className="text-[10px] font-bold text-ivory uppercase tracking-widest font-sans">Subscribe to Luxe Space newsletter</span>
                        <form onSubmit={(e) => e.preventDefault()} className="flex w-full sm:w-[350px] relative rounded-full border border-white-subtle bg-white/5 overflow-hidden focus-within:border-gold-subtle transition-colors duration-300">
                            <input
                                type="email"
                                placeholder="Enter email address"
                                required
                                className="w-full bg-transparent px-5 py-3.5 text-xs text-ivory outline-none placeholder:text-warm-silk/50"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-full bg-warm-gold hover:bg-[#A3865D] flex items-center justify-center text-[#161618] transition-colors duration-300 cursor-pointer"
                                aria-label="Subscribe"
                            >
                                <ArrowRight size={13} />
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="w-full md:w-auto flex flex-col items-start gap-3">
                        <p className="text-xs text-warm-silk/30 mt-1 font-light tracking-wide">Contact us at +91 8966969035</p>
                        <p className="text-xs text-warm-silk/30 mt-1 font-light tracking-wide">Monday to Saturday: 10 AM to 6 PM</p>
                    </div>

                    {/* Copyright */}
                    <div className="text-center md:text-right">
                        <p className="text-xs text-cool-slate font-light">
                            © {new Date().getFullYear()} NOD-Night Owl Designers. All rights reserved.
                        </p>
                        <p className="text-[10px] text-warm-silk/30 mt-1 font-light tracking-wide">
                            Designed in India • Connecting spatial excellence globally.
                        </p>
                    </div>

                </div>

            </div>
        </footer>
    )
}
