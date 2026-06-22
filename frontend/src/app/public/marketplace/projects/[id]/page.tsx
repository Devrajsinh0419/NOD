import { Metadata } from "next"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const id = resolvedParams.id
  return {
    title: `Project Details #${id} | Night Owl Designers`,
    description: `Explore the architectural blueprints, interior designs, floor plans, and project guidelines for Project #${id} on Night Owl Designers.`,
    alternates: {
      canonical: `https://nod-live.vercel.app/public/marketplace/projects/${id}`,
    },
    openGraph: {
      type: "article",
      title: `Project Details #${id} | Night Owl Designers`,
      description: `Explore the architectural blueprints, interior designs, floor plans, and project guidelines for Project #${id} on Night Owl Designers.`,
      url: `https://nod-live.vercel.app/public/marketplace/projects/${id}`,
    }
  }
}

export default async function PublicProjectDetailPage({ params }: Props) {
  const resolvedParams = await params
  const id = resolvedParams.id

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": `Design Project Showcase #${id}`,
    "description": `Architecture and Interior Design execution specifications for Project #${id} listed on Night Owl Designers platform.`,
    "provider": {
      "@type": "Organization",
      "name": "Night Owl Designers",
      "url": "https://nod-live.vercel.app"
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <h1 className="text-3xl font-light text-white font-serif mb-4">Project Details</h1>
      <p className="text-sm text-[#8B7355] mb-6">Viewing project details for project ID: {id}</p>
      <Link href="/public/marketplace/projects">
        <button
          className="px-6 py-2.5 rounded-xl border border-[#C9A96E]/12 hover:bg-[#C9A96E]/5 text-xs text-white/60 transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </Link>
    </div>
  )
}
