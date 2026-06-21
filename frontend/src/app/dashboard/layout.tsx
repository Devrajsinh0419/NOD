"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import logo from "@/public/images/logo.png"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import { projectService } from "@/services/project.service"
import type { User } from "@/types/auth.types"
import type { Project } from "@/types/project.types"
import Link from "next/link"
import { API_BASE } from "@/lib/api"

const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`
}

// Sidebar items per role
const clientItems = [
  { label: "Overview", href: "/dashboard/client" },
  { label: "Projects", href: "/dashboard/client/projects" },
  { label: "Socialize", href: "/dashboard/client/socialize" },
  { label: "Chat", href: "/dashboard/client/chat" },
  { label: "Wallet", href: "/dashboard/client/wallet" },
  { label: "Profile", href: "/dashboard/client/profile" },
]

const buildProfessionalItems = (role: string) => [
  { label: "Overview", href: `/dashboard/${role}` },
  { label: "Projects", href: `/dashboard/${role}/projects` },
  { label: "Marketplace", href: `/dashboard/${role}/marketplace` },
  { label: "Tanders", href: "/tenders" },
  { label: "Socialize", href: `/dashboard/${role}/socialize` },
  { label: "Chat", href: `/dashboard/${role}/chat` },
  { label: "Wallet", href: `/dashboard/${role}/wallet` },
  { label: "Profile", href: `/dashboard/${role}/profile` },
]

const adminItems = [
  { label: "Overview & Moderation", href: "/dashboard/admin" },
  { label: "Profile", href: "/dashboard/admin/profile" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    projects: Project[]
    professionals: User[]
  }>({ projects: [], professionals: [] })
  const [searching, setSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  useEffect(() => {
    const loadUser = () => {
      const stored = authService.getStoredUser()
      if (!stored) {
        router.push("/login")
        return
      }
      setUser(stored)
    }

    loadUser()

    window.addEventListener("storage", loadUser)
    return () => {
      window.removeEventListener("storage", loadUser)
    }
  }, [router])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ projects: [], professionals: [] })
      setShowSearchDropdown(false)
      return
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true)
      setShowSearchDropdown(true)
      try {
        const [projRes, profRes] = await Promise.all([
          projectService.getProjects({ search: searchQuery }),
          userService.searchUsers(searchQuery)
        ])
        setSearchResults({
          projects: projRes.projects || [],
          professionals: profRes.users || []
        })
      } catch (err) {
        console.error("Failed to perform header search:", err)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".header-search-container")) {
        setShowSearchDropdown(false)
      }
    }
    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C9A96E]/15 border-t-[#C9A96E]/60 rounded-full animate-spin" />
      </div>
    )
  }

  // Pick sidebar items based on role
  const role = user.role?.toLowerCase() || "client"
  const sidebarItems =
    role === "client"
      ? clientItems
      : role === "admin"
        ? adminItems
        : buildProfessionalItems(role)

  // Role badge color
  const roleBadgeColor: Record<string, string> = {
    designer: "text-[#C9A96E]",
    architect: "text-[#95C9A4]",
    contractor: "text-[#DEB887]",
    client: "text-[#8B7355]",
  }

  return (
    <div className="h-screen bg-[#0D0D0D] text-[#F5F0E8] flex flex-col overflow-hidden">
      {/* ── TOP BAR ── */}
      <header className="h-16 border-b border-[#C9A96E]/8 bg-[#0D0D0D] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-[#C9A96E]/20 flex items-center justify-center bg-[#C9A96E]/5 overflow-hidden">
            <Image src={logo} alt="NOD" className="w-9 h-9" />
          </div>
          <Link href={`/dashboard/${role}`}>
            <div className="flex items-center leading-none">
              <span className="text-5xl font-bold">N</span>
              <div className="ml-0.3 leading-none">
                <p className="text-2xl font-semibold">OD</p>
                <p className="text-[8px] tracking-[0.2em] text-[#8B7355] uppercase">IGHT OWL DESIGNERS</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center max-w-md flex-1 mx-12 relative header-search-container">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim().length >= 2) setShowSearchDropdown(true) }}
              placeholder="Search projects, professionals..."
              className="w-full rounded-xl border border-[#C9A96E]/50 bg-[#C9A96E]/5 pl-4 pr-10 py-2.5 text-sm text-[#F5F0E8] placeholder-[#8B7355]/50 outline-none transition-all duration-300 focus:border-[#C9A96E]/20 focus:bg-[#C9A96E]/8"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A96E]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#C9A96E]/10 bg-[#1A1714] shadow-2xl p-4 max-h-87.5 overflow-y-auto z-50 space-y-4">
              {searching ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="w-4 h-4 border-2 border-[#C9A96E]/20 border-t-[#C9A96E]/60 rounded-full animate-spin" />
                  <span className="text-xs text-white/40">Searching...</span>
                </div>
              ) : (
                <>
                  {/* Projects Section */}
                  {searchResults.projects.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Projects</p>
                      <div className="space-y-1.5">
                        {searchResults.projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              if (role === "client") {
                                router.push(`/dashboard/client/projects?id=${p.id}`)
                              } else {
                                router.push(`/dashboard/${role}/marketplace?search=${encodeURIComponent(p.title)}`)
                              }
                              setShowSearchDropdown(false)
                              setSearchQuery("")
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors group"
                          >
                            <p className="text-xs font-medium text-[#F5F0E8] group-hover:text-white/95 truncate">{p.title}</p>
                            <p className="text-[10px] text-white/30 truncate mt-0.5">{p.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professionals Section */}
                  {searchResults.professionals.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Professionals</p>
                      <div className="space-y-1.5">
                        {searchResults.professionals.map((prof) => (
                          <button
                            key={prof.id}
                            onClick={() => {
                              router.push(`/dashboard/${role}/socialize?user=${prof.username}`)
                              setShowSearchDropdown(false)
                              setSearchQuery("")
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors group flex items-center gap-2.5"
                          >
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60 shrink-0">
                              {(prof.first_name?.[0] || prof.username[0]).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-[#F5F0E8] group-hover:text-white/95 truncate">
                                {prof.first_name === prof.last_name ? prof.first_name : `${prof.first_name} ${prof.last_name || ""}`.trim()}
                              </p>
                              <p className="text-[10px] text-white/35 capitalize truncate">{prof.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.projects.length === 0 && searchResults.professionals.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-xs text-white/30">No matching projects or professionals</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Theme and User */}
        <div className="flex items-center gap-4">

          {/* User */}
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 group">
              <span className="text-sm text-black/80 lowercase">
                {user.first_name || user.username}
              </span>
              <div className="w-8 h-8 rounded-full border border-[#C9A96E]/20 flex items-center justify-center bg-[#C9A96E]/5 text-[#B8A88A] overflow-hidden relative">
                {user.profile_photo ? (
                  <img
                    src={getMediaUrl(user.profile_photo)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <svg className="w-3.5 h-3.5 text-black/80 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[#C9A96E]/10 bg-[#1A1714] shadow-2xl py-2 z-50">
                <button
                  onClick={() => { router.push(`/dashboard/${role}/profile`); setShowDropdown(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-black/80 hover:text-black hover:bg-white/5 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-[#C45C4D]/70 hover:text-[#C45C4D] hover:bg-[#C45C4D]/5 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ── */}
        <aside className="w-52 border-r border-[#C9A96E]/6 bg-[#0B0B09] py-8 px-4 shrink-0 hidden md:flex flex-col justify-between">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center px-6 py-2 rounded-full text-base transition-all duration-300 ${isActive
                    ? "border border-[#C9A96E]/40 bg-[#C9A96E]/8 text-[#C9A96E] shadow-[0_0_15px_rgba(201,169,110,0.05)]"
                    : "text-[#8B7355] hover:text-[#B8A88A]"
                    }`}
                >
                  {item.label}
                  {item.label === "Marketplace" && (
                    <span className="ml-auto text-[9px] bg-[#C9A96E]/10 text-[#C9A96E]/60 px-1.5 py-0.5 rounded-full font-sans">
                      NEW
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Role tag at bottom of sidebar */}
          <div className="px-4 py-3 rounded-xl bg-[#C9A96E]/3 border border-[#C9A96E]/8">
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#6B5A42] mb-0.5">Logged in as</p>
            <p className={`text-xs capitalize font-medium ${roleBadgeColor[role] || "text-[#8B7355]"}`}>{role}</p>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}