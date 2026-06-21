import "./globals.css"
import Navbar from "@/components/landing/navbar"
import HeroSection from "@/components/landing/hero "
import FeaturedServices from "@/components/landing/featured-services"
import AboutSection from "@/components/landing/about/index"
import FeaturedProjects from "@/components/landing/featured-projects"
import ProcessSection from "@/components/landing/process-section"
import Marque from "@/components/landing/marque/page"
// import DesignersSection from "@/components/landing/designer-section "
import CTASection from "@/components/landing/cta"
import ChatWidget from "@/components/chat/ChatWidget"

export default function Home() {
  return (
    <main className="bg-background text-foreground overflow-hidden">
      <Navbar />
      <HeroSection />
      <Marque />
      <FeaturedServices />
      <FeaturedProjects />
      <AboutSection />
      {/* <DesignersSection /> */}
      <ProcessSection />
      <CTASection />
      <ChatWidget />
    </main>
  )
}