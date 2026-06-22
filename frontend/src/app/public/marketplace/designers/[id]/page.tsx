import { Metadata } from "next"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const id = resolvedParams.id
  return {
    title: `Designer Profile #${id} | Night Owl Designers`,
    description: `View certified architecture, interior design portfolios, and client reviews for Designer #${id} on the premium Night Owl Designers platform.`,
    alternates: {
      canonical: `https://nod-live.vercel.app/public/marketplace/designers/${id}`,
    },
    openGraph: {
      type: "profile",
      title: `Designer Profile #${id} | Night Owl Designers`,
      description: `View certified architecture, interior design portfolios, and client reviews for Designer #${id} on Night Owl Designers.`,
      url: `https://nod-live.vercel.app/public/marketplace/designers/${id}`,
    }
  }
}

export default async function DesignerProfilePage({ params }: Props) {
  const resolvedParams = await params
  const id = resolvedParams.id

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": `Professional Designer #${id}`,
    "jobTitle": "Architect / Interior Designer",
    "worksFor": {
      "@type": "Organization",
      "name": "Night Owl Designers",
      "url": "https://nod-live.vercel.app"
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <h1 className="text-3xl font-light text-white font-serif mb-4">Designer Profile</h1>
      <p className="text-sm text-[#8B7355] mb-6">Viewing profile for designer ID: {id}</p>
      <Link href="/public/marketplace/designers">
        <button
          className="px-6 py-2.5 rounded-xl border border-[#C9A96E]/12 hover:bg-[#C9A96E]/5 text-xs text-white/60 transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </Link>
    </div>
  )
}
