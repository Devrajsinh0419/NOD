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
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const FeaturedProjects = dynamic(() => import("@/components/landing/featured-projects"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const DesignerShowcase = dynamic(() => import("@/components/landing/designer-showcase"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const WhyChooseUs = dynamic(() => import("@/components/landing/why-choose-us"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const ProcessSection = dynamic(() => import("@/components/landing/process-section"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const Statistics = dynamic(() => import("@/components/landing/statistics"), {
  loading: () => <div className="h-48 w-full animate-pulse bg-[#070708]" />
})
const AboutSection = dynamic(() => import("@/components/landing/about/index"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const Testimonials = dynamic(() => import("@/components/landing/testimonials"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const FAQ = dynamic(() => import("@/components/landing/faq"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const CTASection = dynamic(() => import("@/components/landing/cta"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})
const Footer = dynamic(() => import("@/components/landing/footer"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-[#070708]" />
})

// Client-only component (ChatWidget) dynamically loaded
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"))

export default async function Home() {
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
    <main className="bg-background text-foreground overflow-hidden noise-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* Background static layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#C9A96E]/5 to-transparent blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <Marque />
        <div className="content-visibility-auto">
          <FeaturedServices />
        </div>
        <div className="content-visibility-auto">
          <FeaturedProjects />
        </div>
        <div className="content-visibility-auto">
          <WhyChooseUs />
        </div>
        <div className="content-visibility-auto">
          <ProcessSection />
        </div>
        <div className="content-visibility-auto">
          <DesignerShowcase />
        </div>
        <div className="content-visibility-auto">
          <AboutSection />
        </div>
        <div className="content-visibility-auto">
          <Testimonials />
        </div>
        <div className="content-visibility-auto">
          <Statistics />
        </div>
        <div className="content-visibility-auto">
          <FAQ />
        </div>
        <div className="content-visibility-auto">
          <CTASection />
        </div>
        <div className="content-visibility-auto">
          <Footer />
        </div>
        <ChatWidget />
      </div>
    </main>
  )
}