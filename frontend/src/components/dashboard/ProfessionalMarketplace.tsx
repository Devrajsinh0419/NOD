"use client"

/**
 * ProfessionalMarketplace — shared marketplace view for designer / architect / contractor.
 *
 * Usage:
 *   import ProfessionalMarketplace from "@/components/dashboard/ProfessionalMarketplace"
 *   export default function DesignerMarketplacePage() {
 *     return <ProfessionalMarketplace role="designer" />
 *   }
 */

import { useEffect, useState } from "react"
import { projectService } from "@/services/project.service"
import type { Project } from "@/types/project.types"
import MarketplaceProjectCard from "@/components/marketplace/project-card/MarketplaceProjectCard"
import { getMediaUrl } from "@/lib/api"

interface Props {
  role: "designer" | "architect" | "contractor"
}

export default function ProfessionalMarketplace({ role }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)

  // Bid submission state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [proposalText, setProposalText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [selectedViewProject, setSelectedViewProject] = useState<Project | null>(null)

  useEffect(() => {
    loadProjects()
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const q = params.get("search")
      if (q) {
        setSearch(decodeURIComponent(q))
      }
    }
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectService.getMarketplaceProjects()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketplace")
    } finally {
      setLoading(false)
    }
  }

  // Filter projects
  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase())

    const matchesType = !filterType || p.design_type === filterType

    return matchesSearch && matchesType
  })

  const DESIGN_TYPES = [
    "Residential",
    "Commercial",
    "Office",
    "Retail",
    "Hospitality",
    "Healthcare",
    "Educational",
    "Industrial",
    "Mixed Use",
    "Renovation",
    "Interior Design Only",
    "Exterior Design Only",
  ]

  const handleView = (id: number) => {
    const proj = projects.find((p) => p.id === id)
    if (proj) {
      setSelectedViewProject(proj)
    }
  }

  const handleApply = (id: number) => {
    setSelectedProjectId(id)
    setBidAmount("")
    setDuration("")
    setProposalText("")
    setSubmitSuccess(false)
    setSubmitError("")
  }

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) return

    const trimmedAmount = bidAmount.trim()
    const trimmedDuration = duration.trim()
    const trimmedProposal = proposalText.trim()

    // Ensure all three fields are not empty
    if (!trimmedAmount || !trimmedDuration || !trimmedProposal) {
      setSubmitError("All fields are required and cannot be empty.")
      return
    }

    // Ensure bid amount is a valid positive integer
    const amountVal = Number(trimmedAmount)
    if (isNaN(amountVal) || !Number.isInteger(amountVal) || amountVal < 1 || !/^\d+$/.test(trimmedAmount)) {
      setSubmitError("Bid amount must be a whole number (integer) greater than or equal to 1.")
      return
    }

    setSubmitting(true)
    setSubmitError("")
    try {
      await projectService.submitBid(selectedProjectId, {
        amount: amountVal,
        duration: trimmedDuration,
        proposal: trimmedProposal,
      })
      setSubmitSuccess(true)
      await loadProjects()
      setTimeout(() => {
        setSelectedProjectId(null)
      }, 1500)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit proposal")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/60 rounded-full animate-spin" />
          <p className="text-sm text-[#6B5A42] tracking-wide">Loading marketplace…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2
          className="text-3xl font-light text-[#F5F0E8] mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Project Marketplace
        </h2>
        <p className="text-sm text-[#6B5A42]">Discover projects and submit your proposals</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5A42]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, description, or city…"
            className="w-full rounded-xl border border-[#C9A96E]/10 bg-[#C9A96E]/4 pl-11 pr-4 py-3 text-sm text-[#F5F0E8] placeholder-[#8B7355]/50 outline-none transition-all duration-300 focus:border-[#C9A96E]/25 focus:bg-[#C9A96E]/8"
          />
        </div>
        <div className="relative min-w-[200px]">
          <button
            type="button"
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-[#C9A96E]/10 bg-[#C9A96E]/4 px-4 py-3 text-sm text-[#F5F0E8] outline-none transition-all duration-300 focus:border-[#C9A96E]/25 focus:bg-[#C9A96E]/8 hover:border-[#C9A96E]/15 cursor-pointer text-left"
          >
            <span>{filterType || "All Design Types"}</span>
            <svg className={`w-4 h-4 text-[#6B5A42] transition-transform duration-200 ${filterDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          {filterDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setFilterDropdownOpen(false)} 
              />
              <div className="absolute right-0 left-0 mt-2 z-50 max-h-60 overflow-y-auto rounded-xl border border-[#C9A96E]/12 bg-[#1A1714]/10 backdrop-blur-md p-1.5 space-y-0.5 shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("")
                    setFilterDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs rounded-lg transition-colors ${
                    !filterType 
                      ? "bg-[#C9A96E]/15 text-[#F5F0E8] font-medium" 
                      : "text-[#8B7355] hover:bg-[#C9A96E]/5 hover:text-[#F5F0E8]"
                  }`}
                >
                  All Design Types
                </button>
                {DESIGN_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFilterType(t)
                      setFilterDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs rounded-lg transition-colors ${
                      filterType === t 
                        ? "bg-[#C9A96E]/15 text-[#F5F0E8] font-medium" 
                        : "text-[#8B7355] hover:bg-[#C9A96E]/20 hover:text-[#F5F0E8]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[#6B5A42] mb-4">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""} available
      </p>

      {error && (
        <div className="mb-5 text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#C9A96E]/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#5A4A35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l1-5h16l1 5" />
              <path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2" />
              <path d="M5 20V11" />
              <path d="M19 20V11" />
              <rect x="9" y="14" width="6" height="6" rx="1" />
            </svg>
          </div>
          <h3
            className="text-xl font-light text-[#8B7355] mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {search || filterType ? "No matching projects" : "No projects available"}
          </h3>
          <p className="text-sm text-[#6B5A42]">
            {search || filterType
              ? "Try adjusting your search or filters."
              : "Check back soon — new projects are posted regularly."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((project) => (
            <MarketplaceProjectCard
              key={project.id}
              project={project}
              onView={handleView}
              onApply={handleApply}
            />
          ))}
        </div>
      )}
      {selectedProjectId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#1A1714] border border-[#C9A96E]/12 rounded-2xl shadow-2xl overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-light text-[#F5F0E8] font-serif">
                  Submit Proposal
                </h3>
                <p className="text-[11px] text-[#8B7355] mt-1">
                  for {projects.find((p) => p.id === selectedProjectId)?.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="text-[#6B5A42] hover:text-[#B8A88A] transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-emerald-400">Proposal Submitted Successfully</p>
                <p className="text-xs text-[#6B5A42] mt-1">Your bid has been recorded.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid} className="space-y-4">
                {submitError && (
                  <div className="text-xs text-red-400 bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
                    {submitError}
                  </div>
                )}
                
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Bid Amount ($)</label>
                  <input
                    type="number"
                    required
                    step="1"
                    min="1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    placeholder="Enter bid amount..."
                    className="w-full rounded-xl border border-[#C9A96E]/40 bg-[#C9A96E]/4 px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#8B7355]/50 outline-none transition-all focus:border-[#C9A96E]/25 focus:bg-[#C9A96E]/8"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Estimated Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2 weeks, 1 month..."
                    className="w-full rounded-xl border border-[#C9A96E]/40 bg-[#C9A96E]/4 px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#8B7355]/50 outline-none transition-all focus:border-[#C9A96E]/25 focus:bg-[#C9A96E]/8"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Proposal / Cover Letter</label>
                  <textarea
                    required
                    rows={4}
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    placeholder="Describe your approach, deliverables, and relevant experience..."
                    className="w-full rounded-xl border border-[#C9A96E]/40 bg-[#C9A96E]/4 px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#8B7355]/50 outline-none transition-all focus:border-[#C9A96E]/25 focus:bg-[#C9A96E]/8 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProjectId(null)}
                    className="flex-1 py-3 rounded-xl border border-[#C9A96E]/40 hover:bg-[#B8944F] text-xs text-black transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl border border-[#C9A96E]/40 bg-white hover:bg-[#B8944F] text-xs text-black transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Proposal"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── PROJECT DETAILS MODAL ── */}
      {selectedViewProject && (
        <div className="fixed inset-0 z-100 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-serif text-[#F5F0E8] mb-1">{selectedViewProject.title}</h3>
                <p className="text-xs text-[#6B5A42]">
                  Client: {selectedViewProject.client_name || "NightOwl Client"}
                </p>
              </div>
              <button
                onClick={() => setSelectedViewProject(null)}
                className="w-8 h-8 rounded-full border border-[#C9A96E]/12 flex items-center justify-center hover:bg-[#C9A96E]/5 text-[#8B7355] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-[#C9A96E]/40 text-xs">
              <div>
                <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-0.5">Budget</p>
                <p className="font-medium text-black/80">
                  {selectedViewProject.budget_min && selectedViewProject.budget_max
                    ? `${selectedViewProject.currency || "USD"} ${Number(selectedViewProject.budget_min).toLocaleString()} - ${Number(selectedViewProject.budget_max).toLocaleString()}`
                    : "Flexible"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-0.5">Timeline</p>
                <p className="font-medium text-black/80">
                  {selectedViewProject.start_date && selectedViewProject.completion_date
                    ? `${new Date(selectedViewProject.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} - ${new Date(selectedViewProject.completion_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Flexible"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-0.5">Location</p>
                <p className="font-medium text-black/80">
                  {[selectedViewProject.city, selectedViewProject.country].filter(Boolean).join(", ") || "Remote"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-2">Description</p>
              <p className="text-xs text-[#8B7355] leading-relaxed whitespace-pre-wrap">
                {selectedViewProject.description || "No description provided."}
              </p>
            </div>

            {selectedViewProject.attachments && Object.keys(selectedViewProject.attachments).length > 0 && (
              <div>
                <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-2">Attachments</p>
                <div className="space-y-2">
                  {Object.entries(selectedViewProject.attachments).map(([key, urls]) => (
                    <div key={key} className="p-2.5 bg-white/2 border border-[#C9A96E]/20 rounded-lg flex items-center justify-between text-xs">
                      <span className="capitalize text-black/60">{key.replace(/_/g, " ")}</span>
                      <div className="flex gap-1.5">
                        {(Array.isArray(urls) ? urls : [urls]).map((url: string, index) => (
                          <a
                            key={index}
                            href={getMediaUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1  bg-[#C9A96E]/20 hover:bg-[#C9A96E]/50 rounded text-[10px] text-[#B8A88A] transition-colors"
                          >
                            View #{index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#C9A96E]/40">
              <button
                onClick={() => setSelectedViewProject(null)}
                className="px-5 py-2.5 rounded-xl border border-[#C9A96E]/12 text-[#8B7355] text-xs hover:text-white/70 hover:bg-[#B8944F] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedViewProject(null)
                  handleApply(selectedViewProject.id)
                }}
                className="px-5 py-2.5 rounded-xl bg-[#C9A96E]/80 text-[#0D0D0D] text-xs font-semibold hover:bg-[#B8944F] transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
