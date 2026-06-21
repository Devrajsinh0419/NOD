"use client"

import { useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { authService } from "@/services/auth.service"

export default function PublicShowcaseRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const user = authService.getStoredUser()
    if (user && user.role) {
      const role = user.role.toLowerCase()
      router.replace(`/dashboard/${role}/socialize?post=${id}`)
    } else {
      router.replace(`/login?next=/public/showcase/${id}`)
    }
  }, [router, id])

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/50 rounded-full animate-spin" />
        <span className="text-xs text-[#6B5A42] uppercase tracking-widest font-semibold">Redirecting to Showcase Post...</span>
      </div>
    </div>
  )
}
