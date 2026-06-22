import "./globals.css"
import dynamic from "next/dynamic"
import Navbar from "@/components/landing/navbar"
import HeroSection from "@/components/landing/hero "
import Marque from "@/components/landing/marque/page"

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
  return (
    <main className="bg-background text-foreground overflow-hidden">
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