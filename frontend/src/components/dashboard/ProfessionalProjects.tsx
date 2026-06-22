"use client"

import { useEffect, useState } from "react"
import { authService } from "@/services/auth.service"
import { projectService } from "@/services/project.service"
import type { Project } from "@/types/project.types"
import StatusBadge from "@/components/ui/StatusBadge"
import { getMediaUrl } from "@/lib/api"
import { formatToUserCurrency } from "@/utils/currency"

interface Props {
  role: "designer" | "architect" | "contractor"
}

export default function ProfessionalProjects({ role }: Props) {
  const [activeTab, setActiveTab] = useState<"working" | "bids">("working")
  const [workingProjects, setWorkingProjects] = useState<Project[]>([])
  const [biddedProjects, setBiddedProjects] = useState<Array<{ project: Project; bid: any }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Selected project for detailed modal view
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const [requestingCompletion, setRequestingCompletion] = useState(false)

  const handleRequestCompletion = async (projectId: number) => {
    try {
      setRequestingCompletion(true)
      const res = await projectService.requestProjectCompletion(projectId)
      if (res.success) {
        alert(res.message || "Project completion requested successfully!")
        
        // Update status of the selected project
        setSelectedProject((prev) => prev ? { ...prev, status: "AWAITING_CLIENT_APPROVAL" } : null)
        
        // Update status in the workingProjects list
        setWorkingProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: "AWAITING_CLIENT_APPROVAL" } : p))
        )
      } else {
        alert(res.message || "Failed to request project completion")
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to request project completion")
    } finally {
      setRequestingCompletion(false)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const user = authService.getStoredUser()
        if (!user) return
        
        const data = await projectService.getProfessionalProjects(user.id)
        setWorkingProjects(data.working_projects)
        setBiddedProjects(data.bidded_projects)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/60 rounded-full animate-spin" />
          <p className="text-sm text-[#6B5A42] tracking-wide">Loading projects…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-3xl font-light text-[#F5F0E8]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          My Projects
        </h2>
      </div>

      {error && (
        <div className="text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#C9A96E]/8 mb-6">
        <button
          onClick={() => setActiveTab("working")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
            activeTab === "working"
              ? "border-[#C9A96E] text-[#C9A96E]"
              : "border-transparent text-[#8B7355] hover:text-[#B8A88A]"
          }`}
        >
          Working Projects ({workingProjects.length})
        </button>
        <button
          onClick={() => setActiveTab("bids")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${
            activeTab === "bids"
              ? "border-[#C9A96E] text-[#C9A96E]"
              : "border-transparent text-[#8B7355] hover:text-[#B8A88A]"
          }`}
        >
          Bids & Proposals ({biddedProjects.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "working" ? (
        workingProjects.length === 0 ? (
          <div className="rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#C9A96E]/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#5A4A35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-[#8B7355] mb-2 font-serif">No active projects</h3>
            <p className="text-sm text-[#6B5A42]">Browse the professional marketplace to submit bids and win projects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workingProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] p-6 text-left hover:border-[#C9A96E]/8 hover:bg-[#221F1A] transition-all duration-300 group flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-start justify-between mb-3 w-full">
                    <h3 className="text-lg font-light text-black group-hover transition-colors truncate pr-3 font-serif">
                      {project.title}
                    </h3>
                    <StatusBadge status={project.status} />
                  </div>

                  {project.description && (
                    <p className="text-xs text-[#6B5A42] leading-relaxed mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#C9A96E]/6 flex items-center justify-between w-full text-[10px] text-[#6B5A42]">
                  <span>Client: {project.client_name || "NightOwl Client"}</span>
                  <span>Budget: {formatToUserCurrency(project.budget_min, project.currency || "USD")} - {formatToUserCurrency(project.budget_max, project.currency || "USD")}</span>
                </div>
              </button>
            ))}
          </div>
        )
      ) : biddedProjects.length === 0 ? (
        <div className="rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#C9A96E]/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#5A4A35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-light text-[#8B7355] mb-2 font-serif">No bids submitted</h3>
          <p className="text-sm text-[#6B5A42]">Browse the professional marketplace to submit proposals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {biddedProjects.map(({ project, bid }) => (
            <button
              key={bid.id}
              onClick={() => setSelectedProject(project)}
              className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] p-6 text-left hover:border-[#C9A96E]/18 hover:bg-[#221F1A] transition-all duration-300 group flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-start justify-between mb-3 w-full">
                  <h3 className="text-lg font-light text-white group-hover:text-white/90 transition-colors truncate pr-3 font-serif">
                    {project.title}
                  </h3>
                  <StatusBadge status={bid.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-[#C9A96E]/6 w-full">
                  <div>
                    <p className="text-[9px] text-[#6B5A42] uppercase">My Bid</p>
                    <p className="text-xs font-medium text-[#F5F0E8]">{formatToUserCurrency(bid.amount, bid.currency || project.currency || "USD")}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#6B5A42] uppercase">Duration</p>
                    <p className="text-xs text-[#B8A88A]">{bid.duration}</p>
                  </div>
                </div>

                {bid.proposal && (
                  <p className="text-[11px] text-[#8B7355] leading-relaxed mb-2 line-clamp-2">
                    {bid.proposal}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#C9A96E]/6 flex items-center justify-between w-full text-[10px] text-[#6B5A42]">
                <span>Submitted: {new Date(bid.created_at).toLocaleDateString()}</span>
                <span>Project status: {project.status}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── PROJECT DETAILS MODAL ── */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-serif text-[#F5F0E8] mb-1">{selectedProject.title}</h3>
                <p className="text-xs text-[#6B5A42]">
                  Client: {selectedProject.client_name || "NightOwl Client"}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 rounded-full border border-[#C9A96E]/12 flex items-center justify-center hover:bg-[#C9A96E]/5 text-[#8B7355] hover:text-[#F5F0E8] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-[#C9A96E]/40 text-xs">
              <div>
                <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-0.5">Budget</p>
                <p className="font-medium text-[#B8A88A]">
                  {formatToUserCurrency(selectedProject.budget_min, selectedProject.currency || "USD")} - {formatToUserCurrency(selectedProject.budget_max, selectedProject.currency || "USD")}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-0.5">Timeline</p>
                <p className="font-medium text-[#B8A88A]">
                  {selectedProject.start_date && selectedProject.completion_date
                    ? `${new Date(selectedProject.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} - ${new Date(selectedProject.completion_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Flexible"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-0.5">Location</p>
                <p className="font-medium text-[#B8A88A]">
                  {[selectedProject.city, selectedProject.country].filter(Boolean).join(", ") || "Remote"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-2">Description</p>
              <p className="text-xs text-[#8B7355] leading-relaxed whitespace-pre-wrap">
                {selectedProject.description || "No description provided."}
              </p>
            </div>

            {selectedProject.attachments && Object.keys(selectedProject.attachments).length > 0 && (
              <div>
                <p className="text-[10px] text-[#6B5A42] uppercase tracking-wider mb-2">Attachments</p>
                <div className="space-y-2">
                  {Object.entries(selectedProject.attachments).map(([key, urls]) => (
                    <div key={key} className="p-2.5 bg-white/2 border border-[#C9A96E]/20 rounded-lg flex items-center justify-between text-xs">
                      <span className="capitalize text-[#B8A88A]">{key.replace(/_/g, " ")}</span>
                      <div className="flex gap-1.5">
                        {(Array.isArray(urls) ? urls : [urls]).map((url: string, index) => (
                          <a
                            key={index}
                            href={getMediaUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-[#C9A96E]/20 hover:bg-[#C9A96E]/50 rounded text-[10px] text-[#B8A88A] transition-colors"
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

            <div className="flex justify-between items-center pt-4 border-t border-[#C9A96E]/6">
              <div>
                {selectedProject.status === "ADVANCE_PAID" && (
                  <button
                    onClick={() => handleRequestCompletion(selectedProject.id)}
                    disabled={requestingCompletion}
                    className="px-5 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#B8944F] text-[#0D0D0D] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {requestingCompletion ? "Submitting..." : "Request Project Completion"}
                  </button>
                )}
                {selectedProject.status === "AWAITING_CLIENT_APPROVAL" && (
                  <span className="text-xs text-[#8B7355] italic">Completion requested. Awaiting client final approval and payment.</span>
                )}
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2.5 rounded-xl border border-[#C9A96E]/20 text-[#8B7355] text-xs hover:text-[#B8A88A] hover:bg-[#C9A96E] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
