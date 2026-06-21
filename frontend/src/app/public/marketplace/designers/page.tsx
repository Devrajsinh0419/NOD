"use client"

import { useRouter } from "next/navigation"

export default function DesignersListPage() {
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-center">
      <h1 className="text-3xl font-light text-white font-serif mb-4">Designers Marketplace</h1>
      <p className="text-sm text-[#8B7355] mb-6">List of design professionals on NightOwl.</p>
      <button
        onClick={() => router.back()}
        className="px-6 py-2.5 rounded-xl border border-[#C9A96E]/12 hover:bg-[#C9A96E]/5 text-xs text-white/60 transition-colors"
      >
        Go Back
      </button>
    </div>
  )
}
