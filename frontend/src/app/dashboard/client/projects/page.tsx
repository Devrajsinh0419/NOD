"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import { projectService } from "@/services/project.service"
import type { Project, ProjectCreateData, ProjectUpdateData } from "@/types/project.types"
import { PROFESSIONAL_ROLE_LABELS } from "@/types/project.types"
import StatusBadge from "@/components/ui/StatusBadge"
import ProjectForm from "@/components/dashboard/ProjectForm"
import { getMediaUrl } from "@/lib/api"
import EscrowPaymentModal from "@/components/dashboard/EscrowPaymentModal"

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Bids state
  const [bids, setBids] = useState<any[]>([])
  const [loadingBids, setLoadingBids] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Escrow Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentModalMode, setPaymentModalMode] = useState<"accept_bid" | "complete_project">("accept_bid")
  const [paymentModalTargetId, setPaymentModalTargetId] = useState<number>(0)

  // Selected project or new-project mode
  const selectedId = searchParams.get("id") ? Number(searchParams.get("id")) : null
  const isNew = searchParams.get("new") === "1"

  const selectedProject = selectedId ? projects.find((p) => p.id === selectedId) || null : null
  const showForm = isNew || selectedProject !== null

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedId) {
      loadProjectBids(selectedId)
      setIsEditing(false)
    }
  }, [selectedId])

  const loadProjects = async () => {
    try {
      const user = authService.getStoredUser()
      if (!user) return
      const data = await projectService.getClientProjects(user.id)
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const loadProjectBids = async (projectId: number) => {
    setLoadingBids(true)
    try {
      const data = await projectService.getProjectBids(projectId)
      setBids(data)
    } catch (err) {
      console.error("Failed to load project bids:", err)
    } finally {
      setLoadingBids(false)
    }
  }

  const handleSave = async (data: ProjectCreateData | ProjectUpdateData) => {
    const user = authService.getStoredUser()
    if (!user) return

    if (selectedProject) {
      const updated = await projectService.updateProject(selectedProject.id, data)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setIsEditing(false)
    } else {
      const created = await projectService.createProject(data as ProjectCreateData)
      setProjects((prev) => [created, ...prev])
      router.push(`/dashboard/client/projects?id=${created.id}`)
    }
  }

  const handlePublish = async () => {
    if (!selectedProject) return
    try {
      const published = await projectService.publishProject(selectedProject.id)
      setProjects((prev) => prev.map((p) => (p.id === published.id ? published : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish project")
    }
  }

  const handleAcceptBid = (bidId: number) => {
    setPaymentModalTargetId(bidId)
    setPaymentModalMode("accept_bid")
    setPaymentModalOpen(true)
  }

  const handlePaymentSuccess = (result: any) => {
    setPaymentModalOpen(false)
    if (paymentModalMode === "accept_bid") {
      // Update local project status and assigned professional
      setProjects((prev) => prev.map((p) => (p.id === result.project.id ? result.project : p)))
      // Update local bids status
      setBids((prev) =>
        prev.map((b) => {
          if (b.id === paymentModalTargetId) return { ...b, status: "accepted" }
          return { ...b, status: "rejected" }
        })
      )
    } else {
      // Release payment mode: result has updated project
      const updatedProj = result.data || result.project || result
      setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)))
    }
  }

  const handleBack = () => {
    router.push("/dashboard/client/projects")
  }

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }
    try {
      await projectService.deleteProject(projectId)
      if (selectedId === projectId) {
        router.push("/dashboard/client/projects")
      }
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project")
    }
  }

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

  // ── Form View / Edit View ──
  if (showForm && (isNew || isEditing)) {
    return (
      <ProjectForm
        project={selectedProject}
        onSave={handleSave}
        onPublish={selectedProject ? handlePublish : undefined}
        onBack={() => {
          if (isNew) {
            router.push("/dashboard/client/projects")
          } else {
            setIsEditing(false)
          }
        }}
      />
    )
  }

  // ── Detail View ──
  if (selectedProject && !isEditing) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back and edit headers */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-[#6B5A42] text-xs hover:text-[#8B7355] transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Projects
          </button>
          <div className="flex gap-3">
            {selectedProject.status === "draft" && (
              <button
                onClick={handlePublish}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#F5F0E8] text-xs font-medium transition-colors"
              >
                Publish Project
              </button>
            )}
            {["draft", "open"].includes(selectedProject.status) && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 rounded-xl border border-[#C9A96E]/12 hover:bg-[#C9A96E]/80 text-[#F5F0E8] text-xs font-medium transition-colors"
              >
                Edit Project
              </button>
            )}
            <button
              onClick={() => handleDeleteProject(selectedProject.id)}
              className="px-4 py-2.5 rounded-xl bg-red-950/20 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
            >
              Delete Project
            </button>
          </div>
        </div>

        {/* Project Header */}
        <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-light text-[#F5F0E8] font-serif mb-1">
                {selectedProject.title}
              </h2>
              <p className="text-xs text-[#6B5A42]">
                Created on {new Date(selectedProject.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <StatusBadge status={selectedProject.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-[#C9A96E]/40">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#6B5A42] mb-1">Budget Range</p>
              <p className="text-sm text-black/60 font-medium">
                {selectedProject.budget_min && selectedProject.budget_max
                  ? `$${Number(selectedProject.budget_min).toLocaleString()} - $${Number(selectedProject.budget_max).toLocaleString()}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#6B5A42] mb-1">Timeline</p>
              <p className="text-sm text-black/60 font-medium">
                {selectedProject.start_date && selectedProject.completion_date
                  ? `${new Date(selectedProject.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} - ${new Date(selectedProject.completion_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                  : "No set timeline"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#6B5A42] mb-1">Location</p>
              <p className="text-sm text-black/60">
                {[selectedProject.city, selectedProject.country].filter(Boolean).join(", ") || "Remote / No Location"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#6B5A42] mb-1">Design Style</p>
              <p className="text-sm text-black/60">
                {selectedProject.preferred_style || "Any"}
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Payment Section (if AWAITING_CLIENT_APPROVAL) */}
        {selectedProject.status === "AWAITING_CLIENT_APPROVAL" && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-serif text-amber-400" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Milestone Completion Awaiting Approval</h4>
              <p className="text-xs text-[#8B7355] leading-relaxed">
                The professional has requested completion of the project. Please review their submission. To confirm completion, pay the remaining 30% milestone payout.
              </p>
            </div>
            <button
              onClick={() => {
                setPaymentModalTargetId(selectedProject.id)
                setPaymentModalMode("complete_project")
                setPaymentModalOpen(true)
              }}
              className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
            >
              Approve & Pay Remaining 30%
            </button>
          </div>
        )}

        {/* Progress Notice (if ADVANCE_PAID) */}
        {selectedProject.status === "ADVANCE_PAID" && (
          <div className="rounded-2xl border border-[#C9A96E]/20 bg-[#C9A96E]/3 p-6">
            <h4 className="text-sm font-medium text-[#C9A96E] mb-1">Project in Progress</h4>
            <p className="text-xs text-[#8B7355] leading-relaxed">
              Escrow payment of 70% advance amount has been secured. The professional is currently working on the project. Once complete, they will submit a completion request.
            </p>
          </div>
        )}

        {/* Detail Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Side: Info, Docs, Assigned Partner */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6">
              <h3 className="text-lg font-light text-[#F5F0E8] font-serif mb-3">Project Description</h3>
              <p className="text-xs text-[#8B7355] leading-relaxed whitespace-pre-wrap">
                {selectedProject.description || "No description provided."}
              </p>
            </div>

            {/* Documents/Attachments */}
            <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6">
              <h3 className="text-lg font-light text-[#F5F0E8] font-serif mb-4">Attachments & Reference Images</h3>
              {Object.keys(selectedProject.attachments || {}).length === 0 ? (
                <p className="text-xs text-[#6B5A42]">No attachments uploaded.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(selectedProject.attachments || {}).map(([key, urls]) => (
                    <div key={key} className="p-3 bg-white/2 border border-[#C9A96E]/40 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs text-black/60 font-medium capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-[#6B5A42] mt-0.5">
                          {Array.isArray(urls) ? urls.length : 1} file(s)
                        </p>
                      </div>
                      <div className="flex gap-2">
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
              )}
            </div>

            {/* Assigned Partner */}
            {selectedProject.assigned_professional_name && (
              <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6">
                <h3 className="text-lg font-light text-[#F5F0E8] font-serif mb-3">Assigned Partner</h3>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C9A96E]/5 border border-[#C9A96E]/12 flex items-center justify-center text-[#F5F0E8] font-medium text-sm">
                    {selectedProject.assigned_professional_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">
                      {selectedProject.assigned_professional_name}
                    </p>
                    <p className="text-[10px] text-[#6B5A42] tracking-wide uppercase mt-0.5">
                      Assigned Professional
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Bids list */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6">
              <h3 className="text-lg font-light text-[#F5F0E8] font-serif mb-4">Proposals & Bids</h3>

              {loadingBids ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/50 rounded-full animate-spin" />
                </div>
              ) : bids.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-[#6B5A42] mb-1">No bids received yet.</p>
                  {selectedProject.status === "draft" ? (
                    <p className="text-[10px] text-[#5A4A35]">Publish this project to receive bids from professionals.</p>
                  ) : (
                    <p className="text-[10px] text-[#5A4A35]">Professionals will submit proposals here soon.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div
                      key={bid.id}
                      className={`p-4 rounded-xl border transition-all duration-300 ${bid.status === "accepted"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : bid.status === "rejected"
                          ? "bg-white/1 border-[#C9A96E]/6 opacity-50"
                          : "bg-white/2 border-[#C9A96E]/8 hover:border-[#C9A96E]/15"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-medium text-black">{bid.designer_name}</p>
                          <p className="text-[9px] text-[#6B5A42] tracking-wide uppercase mt-0.5">{bid.designer_role}</p>
                        </div>
                        <StatusBadge status={bid.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-[#C9A96E]/6">
                        <div>
                          <p className="text-[9px] text-[#6B5A42] uppercase">Bid Amount</p>
                          <p className="text-xs font-medium text-black">${Number(bid.amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#6B5A42] uppercase">Duration</p>
                          <p className="text-xs text-black">{bid.duration || bid.timeline}</p>
                        </div>
                      </div>

                      {bid.proposal && (
                        <p className="text-[11px] text-[#8B7355] leading-relaxed mb-3 line-clamp-3">
                          {bid.proposal}
                        </p>
                      )}

                      {selectedProject.status === "open" && bid.status === "pending" && (
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="w-full py-2 rounded-lg bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#B8944F] text-[10px] font-medium transition-colors"
                        >
                          Accept Proposal
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── List View ──
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl font-light text-[#F5F0E8]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          My Projects
        </h2>
        <button
          onClick={() => router.push("/dashboard/client/projects?new=1")}
          className="px-5 py-3 rounded-xl bg-[#C9A96E]/80 text-[#0D0D0D] text-sm font-medium hover:bg-[#B8944F] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </div>

      {error && (
        <div className="mb-5 text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#C9A96E]/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#5A4A35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3
            className="text-xl font-light text-[#8B7355] mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            No projects created yet
          </h3>
          <p className="text-sm text-[#6B5A42] mb-6">Create your first project to get started.</p>
          <button
            onClick={() => router.push("/dashboard/client/projects?new=1")}
            className="px-6 py-3 rounded-xl bg-[#C9A96E] text-[#0D0D0D] text-sm font-medium hover:bg-[#B8944F] transition-colors"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => router.push(`/dashboard/client/projects?id=${project.id}`)}
              className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6 text-left
                         hover:border-[#C9A96E]/18 hover:bg-[#221F1A] transition-all duration-300 group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-light text-[#F5F0E8] group-hover:text-white/90 transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={project.status} />
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteProject(project.id)
                    }}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                    title="Delete Project"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </span>
                </div>
              </div>

              {project.description && (
                <p className="text-xs text-[#6B5A42] leading-relaxed mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {project.design_type && (
                  <span className="px-2 py-0.5 rounded-md bg-[#C9A96E]/5 text-[10px] text-black/60 border border-[#C9A96E]/8">
                    {project.design_type}
                  </span>
                )}
                {project.preferred_style && (
                  <span className="px-2 py-0.5 rounded-md bg-[#C9A96E]/5 text-[10px] text-black/60 border border-[#C9A96E]/8">
                    {project.preferred_style}
                  </span>
                )}
              </div>

              {project.required_professionals && project.required_professionals.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.required_professionals.slice(0, 3).map((r) => (
                    <span key={r} className="text-[9px] text-[#6B5A42] tracking-wide">
                      {PROFESSIONAL_ROLE_LABELS[r]}
                    </span>
                  ))}
                  {project.required_professionals.length > 3 && (
                    <span className="text-[9px] text-[#5A4A35]">+{project.required_professionals.length - 3} more</span>
                  )}
                </div>
              )}
            </button>
          ))}

          {/* New Project card */}
          <button
            onClick={() => router.push("/dashboard/client/projects?new=1")}
            className="rounded-2xl border-2 border-dashed border-[#C9A96E]/10 bg-transparent p-6 flex flex-col items-center justify-center min-h-180px
                       hover:border-[#C9A96E]/15 hover:bg-[#C9A96E]/3 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#C9A96E]/5 flex items-center justify-center mb-3 group-hover:bg-[#C9A96E]/12 transition-colors">
              <svg className="w-5 h-5 text-[#6B5A42] group-hover:text-[#8B7355] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <p className="text-xs text-[#6B5A42] group-hover:text-[#8B7355] transition-colors">New Project</p>
          </button>
        </div>
      )}

      <EscrowPaymentModal
        isOpen={paymentModalOpen}
        mode={paymentModalMode}
        targetId={paymentModalTargetId}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
