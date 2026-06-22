import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Architects & Interior Designers Directory | Night Owl Designers",
  description: "Browse and discover top architects, interior designers, landscape specialists, and contractors across India on the Night Owl Designers platform.",
  alternates: {
    canonical: "https://nod-live.vercel.app/public/marketplace/designers",
  },
}

export default function DesignersListPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-center">
      <h1 className="text-3xl font-light text-white font-serif mb-4">Designers & Architects Directory</h1>
      <p className="text-sm text-[#8B7355] mb-6">Connect with certified design and construction professionals on Night Owl Designers.</p>
      <Link href="/">
        <button
          className="px-6 py-2.5 rounded-xl border border-[#C9A96E]/12 hover:bg-[#C9A96E]/5 text-xs text-white/60 transition-colors cursor-pointer"
        >
          Return Home
        </button>
      </Link>
    </div>
  )
}
