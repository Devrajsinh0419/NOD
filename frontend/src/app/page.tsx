import "./globals.css"
import dynamic from "next/dynamic"
import { Metadata } from "next"
import Navbar from "@/components/landing/navbar"
import HeroSection from "@/components/landing/hero "
import Marque from "@/components/landing/marque/page"

export const metadata: Metadata = {
  title: 'Night Owl Designers (NOD) | Architectural & Interior Design Marketplace',
  description: 'Premium platform connecting clients with top architects, interior designers, contractors, and government tenders across India.',
  alternates: {
    canonical: 'https://nod-live.vercel.app',
  },
}

// Dynamically import below-the-fold components with SSR enabled
const FeaturedServices = dynamic(() => import("@/components/landing/featured-services"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#1A1714]" />
})
const FeaturedProjects = dynamic(() => import("@/components/landing/featured-projects"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#1A1714]" />
})
const AboutSection = dynamic(() => import("@/components/landing/about/index"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#1A1714]" />
})
const ProcessSection = dynamic(() => import("@/components/landing/process-section"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#1A1714]" />
})
const CTASection = dynamic(() => import("@/components/landing/cta"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#1A1714]" />
})

// Client-only component (ChatWidget) dynamically loaded
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"))

export default function Home() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Night Owl Designers",
    "alternateName": "NOD",
    "url": "https://nod-live.vercel.app",
    "logo": "https://nod-live.vercel.app/images/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 98752 78062",
      "contactType": "customer service",
      "email": "nightowldesignershelp@gmail.com"
    },
    "sameAs": [
      "https://www.instagram.com/nod._india/",
      "https://www.facebook.com/"
    ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Night Owl Designers",
    "url": "https://nod-live.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nod-live.vercel.app/tenders?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main className="bg-background text-foreground overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <Marque />
      <FeaturedServices />
      <FeaturedProjects />
      <AboutSection />
      <ProcessSection />
      <CTASection />
      <ChatWidget />
    </main>
  )
}