import Navbar from "@/components/landing/navbar"
import HeroSection from "@/components/landing/hero "
import FeaturedServices from "@/components/landing/featured-services"
import FeaturedProjects from "@/components/landing/featured-projects"
import ProcessSection from "@/components/landing/process-section"
// import DesignersSection from "@/components/landing/designer-section "
import CTASection from "@/components/landing/cta"

export default function HomePage() {
  return (
    <main className="bg-background text-foreground overflow-hidden">
      <Navbar />
      <HeroSection />
      <FeaturedServices />
      <FeaturedProjects />
      <h1>hello world</h1>
      {/* <DesignersSection /> */}
      <ProcessSection />
      <CTASection />
    </main>
  )
}