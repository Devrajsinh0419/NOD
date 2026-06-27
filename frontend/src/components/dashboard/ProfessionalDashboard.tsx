"use client"

/**
 * ProfessionalDashboard — shared component for designer / architect / contractor dashboards.
 *
 * Usage:
 *   import ProfessionalDashboard from "@/components/dashboard/ProfessionalDashboard"
 *   export default function DesignerPage() {
 *     return <ProfessionalDashboard role="designer" />
 *   }
 */

import { useEffect, useState } from "react"
import { authService } from "@/services/auth.service"
import { projectService } from "@/services/project.service"
import type { Project, ClientDashboardData } from "@/types/project.types"
import { PROFESSIONAL_ROLE_LABELS } from "@/types/project.types"
import StatusBadge from "@/components/ui/StatusBadge"
import { useRouter } from "next/navigation"

// ─── Role-specific onboarding config ──────────────────────────────────────────

const ONBOARDING: Record<string, {
  title: string
  subtitle: string
  fields: Array<{
    id: string
    label: string
    type: "text" | "number" | "select" | "textarea" | "file" | "multifile"
    placeholder?: string
    options?: string[]
  }>
}> = {
  designer: {
    title: "Set Up Your Designer Profile",
    subtitle: "Showcase your style and attract the right clients.",
    fields: [
      { id: "bio", label: "Short Bio", type: "textarea", placeholder: "Tell clients about your design philosophy..." },
      { id: "specialization", label: "Specialization", type: "select", options: ["Interior Design", "Residential", "Commercial", "Hospitality", "Retail", "Landscape"] },
      { id: "style", label: "Signature Style", type: "select", options: ["Modern", "Minimalist", "Luxury", "Scandinavian", "Industrial", "Eclectic"] },
      { id: "experience", label: "Years of Experience", type: "number", placeholder: "e.g. 5" },
      { id: "rate", label: "Hourly Rate (USD)", type: "number", placeholder: "e.g. 80" },
      { id: "portfolio", label: "Portfolio Images", type: "multifile" },
      { id: "certifications", label: "Certifications / Docs", type: "file" },
    ],
  },
  architect: {
    title: "Set Up Your Architect Profile",
    subtitle: "Highlight your expertise and win more projects.",
    fields: [
      { id: "bio", label: "Short Bio", type: "textarea", placeholder: "Describe your architectural approach..." },
      { id: "license", label: "License Number", type: "text", placeholder: "e.g. AR-123456" },
      { id: "specialization", label: "Project Type", type: "select", options: ["Residential", "Commercial", "Mixed-Use", "Industrial", "Urban Planning", "Renovation"] },
      { id: "software", label: "Primary Software", type: "select", options: ["AutoCAD", "Revit", "ArchiCAD", "SketchUp", "Rhino", "BIM 360"] },
      { id: "experience", label: "Years of Experience", type: "number", placeholder: "e.g. 10" },
      { id: "projectBudgetMax", label: "Max Project Budget (USD)", type: "number", placeholder: "e.g. 500000" },
      { id: "portfolio", label: "Portfolio / Drawings", type: "multifile" },
      { id: "license_doc", label: "License Document", type: "file" },
    ],
  },
  contractor: {
    title: "Set Up Your Contractor Profile",
    subtitle: "Show clients what you can build.",
    fields: [
      { id: "bio", label: "Company / Personal Bio", type: "textarea", placeholder: "Describe your contracting services..." },
      { id: "trade", label: "Primary Trade", type: "select", options: ["General Contractor", "Electrical", "Plumbing", "Carpentry", "Masonry", "Painting", "HVAC", "Roofing"] },
      { id: "gstin", label: "GSTIN Number", type: "text", placeholder: "e.g. 22AAAAA0000A1Z5" },
      { id: "experience", label: "Years of Experience", type: "number", placeholder: "e.g. 8" },
      { id: "teamSize", label: "Team Size (Optional)", type: "number", placeholder: "e.g. 12" },
      { id: "portfolio", label: "Past Work Photos", type: "multifile" },
      { id: "license_doc", label: "GSTIN Certificate", type: "file" },
    ],
  },
}

// ─── GSTIN validation ──────────────────────────────────────────────────────────
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

function validateGSTIN(value: string): { valid: boolean; message: string } {
  const trimmed = value.trim().toUpperCase()
  if (trimmed.length === 0) return { valid: false, message: "GSTIN is required" }
  if (trimmed.length !== 15) return { valid: false, message: `Must be 15 characters (currently ${trimmed.length})` }
  if (trimmed !== value.trim()) return { valid: false, message: "Must be uppercase" }
  if (!GSTIN_REGEX.test(trimmed)) return { valid: false, message: "Invalid GSTIN format" }
  return { valid: true, message: "Valid GSTIN ✓" }
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  role: "designer" | "architect" | "contractor"
}

export default function ProfessionalDashboard({ role }: Props) {
  const config = ONBOARDING[role]

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [gstinStatus, setGstinStatus] = useState<{ valid: boolean; message: string } | null>(null)

  // Generic form state — keyed by field id
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formFiles, setFormFiles] = useState<Record<string, File | FileList | null>>({})

  const [dashboardData, setDashboardData] = useState<ClientDashboardData | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const user = authService.getStoredUser()
        if (!user) return



        const dashboard = await projectService.getProfessionalDashboard(user.id)
        setDashboardData(dashboard)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setError("")
    try {
      // Validate required fields (non-file, non-optional)
      const optionalFields = ["teamSize"]
      const missing = config.fields
        .filter((f) => f.type !== "file" && f.type !== "multifile")
        .filter((f) => !optionalFields.includes(f.id))
        .filter((f) => !formValues[f.id])
      if (missing.length > 0) {
        setError(`Please fill in: ${missing.map((f) => f.label).join(", ")}`)
        return
      }

      if (formValues.bio && formValues.bio.length > 150) {
        setError(`Bio must be at most 150 characters. Currently: ${formValues.bio.length} characters.`)
        return
      }

      console.log("Saving profile:", formValues, formFiles)

      const stored = authService.getStoredUser()
      if (stored) {
        stored.profile_completion_percentage = 100
        localStorage.setItem("nod_user", JSON.stringify(stored))
      }
      setShowOnboarding(false)

      setLoading(true)
      const user = authService.getStoredUser()
      if (user) {
        const dashboard = await projectService.getProfessionalDashboard(user.id)
        setDashboardData(dashboard)
      }
    } catch {
      setError("Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    const stored = authService.getStoredUser()
    if (stored) {
      stored.profile_completion_percentage = 100
      localStorage.setItem("nod_user", JSON.stringify(stored))
    }
    setShowOnboarding(false)

    setLoading(true)
    const user = authService.getStoredUser()
    if (user) {
      projectService.getProfessionalDashboard(user.id)
        .then((dashboard) => setDashboardData(dashboard))
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }

  const setValue = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }))
    if (id === "gstin") setGstinStatus(null)
  }

  const handleVerifyGSTIN = () => {
    const result = validateGSTIN(formValues.gstin || "")
    setGstinStatus(result)
    if (formValues.gstin) {
      setFormValues((prev) => ({ ...prev, gstin: prev.gstin.trim().toUpperCase() }))
    }
  }

  const setFile = (id: string, value: File | FileList | null) =>
    setFormFiles((prev) => ({ ...prev, [id]: value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/60 rounded-full animate-spin" />
          <p className="text-sm text-[#6B5A42] tracking-wide">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !showOnboarding) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-sm text-red-400/70 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-xs text-[#8B7355] hover:text-[#B8A88A] underline underline-offset-4 transition-colors">
            Try again
          </button>
        </div>
      </div>
    )
  }

  const projects = dashboardData?.projects || []
  const stats = dashboardData?.stats
  const meetings = dashboardData?.upcoming_meetings || []
  const notifications = dashboardData?.notifications || []
  const activity = dashboardData?.recent_activity || []

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: String(stats?.active_projects ?? 0).padStart(2, "0"), label: "Active Projects" },
              { value: String(stats?.saved_professionals ?? 0).padStart(2, "0"), label: "Bids Submitted" },
              { value: String(stats?.pending_quotes ?? 0).padStart(2, "0"), label: "Pending Bids" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6 text-center
                           hover:border-[#C9A96E]/15 hover:bg-[#221F1A] transition-all duration-300 group"
              >
                <p
                  className="text-4xl lg:text-5xl font-light text-[#F5F0E8] mb-2 group-hover:scale-105 transition-transform duration-300"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B5A42]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Project Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-xl font-light text-black/80"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Projects I'm Working On
              </h3>
            </div>

            {projects.length === 0 ? (
              <div
                className="w-full rounded-2xl border-2 border-dashed border-[#C9A96E]/10 bg-transparent p-8 flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#C9A96E]/5 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#5A4A35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-[#6B5A42]">No Active Projects</p>
                <p className="text-[10px] text-[#5A4A35] mt-1">Browse the marketplace to submit proposals and win projects.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((project: Project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-5 text-left
                               hover:border-[#C9A96E]/18 hover:bg-[#221F1A] transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-base font-light text-[#F5F0E8] group-hover:text-white/90 transition-colors truncate pr-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {project.title}
                      </h4>
                      <StatusBadge status={project.status} />
                    </div>

                    {project.description && (
                      <p className="text-xs text-[#6B5A42] leading-relaxed mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {project.design_type && (
                        <span className="px-2 py-0.5 rounded-md bg-[#C9A96E]/5 text-[10px] text-[#6B5A42] border border-[#C9A96E]/8">
                          {project.design_type}
                        </span>
                      )}
                      {project.preferred_style && (
                        <span className="px-2 py-0.5 rounded-md bg-[#C9A96E]/5 text-[10px] text-[#6B5A42] border border-[#C9A96E]/8">
                          {project.preferred_style}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-5">
            <h4
              className="text-lg font-light text-[#F5F0E8] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Upcoming Meetings
            </h4>
            <div className="space-y-4">
              {meetings.map((m, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#C9A96E]/30 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-white/60">{m.title}</p>
                    <p className="text-[11px] text-[#6B5A42]">
                      {m.date} • {m.time}
                    </p>
                  </div>
                </div>
              ))}
              {meetings.length === 0 && (
                <p className="text-xs text-[#6B5A42]">No upcoming meetings</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-5">
            <h4
              className="text-lg font-light text-[#F5F0E8] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Notifications
            </h4>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <div
                    className={`w-1 h-1 rounded-full mt-2 shrink-0 ${n.is_read ? "bg-white/15" : "bg-[#C9A96E]/40"
                      }`}
                  />
                  <p className="text-xs text-[#8B7355] leading-relaxed">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-[#6B5A42]">No new notifications</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-5">
            <h4
              className="text-lg font-light text-[#F5F0E8] mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Recent Activity
            </h4>
            <div className="space-y-3">
              {activity.slice(0, 4).map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
                  <p className="text-xs text-[#8B7355] leading-relaxed">{a.description}</p>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-xs text-[#6B5A42]">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ONBOARDING MODAL ── */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-8 max-h-[90vh] overflow-y-auto">

            <h2
              className="text-3xl text-[#F5F0E8] mb-1"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {config.title}
            </h2>
            <p className="text-[#8B7355] text-sm mb-8">{config.subtitle}</p>

            {error && (
              <p className="mb-5 text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <div className="space-y-5">
              {config.fields.map((field) => {
                const baseClass =
                  "w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#8B7355]/50 outline-none transition-all duration-300 focus:border-[#C9A96E]/30 focus:bg-[#C9A96E]/[0.08]"

                return (
                  <div key={field.id}>
                    <label className="block text-[10px] uppercase tracking-[0.25em] text-white/35 mb-2">
                      {field.label}
                    </label>

                    {field.type === "textarea" && (
                      <div>
                        <textarea
                          rows={3}
                          placeholder={field.placeholder}
                          value={formValues[field.id] || ""}
                          onChange={(e) => setValue(field.id, e.target.value)}
                          maxLength={field.id === "bio" ? 150 : undefined}
                          className={baseClass}
                        />
                        {field.id === "bio" && (
                          <div className="flex justify-between mt-1 text-[10px]">
                            <span className={(formValues[field.id]?.length || 0) > 150 ? "text-red-400/60" : "text-white/35"}>
                              Character count: {formValues[field.id]?.length || 0} / 150
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {(field.type === "text" || field.type === "number") && field.id !== "gstin" && (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formValues[field.id] || ""}
                        onChange={(e) => setValue(field.id, e.target.value)}
                        className={baseClass}
                      />
                    )}

                    {/* GSTIN field with verify button */}
                    {field.id === "gstin" && (
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={15}
                            placeholder={field.placeholder}
                            value={formValues[field.id] || ""}
                            onChange={(e) => setValue(field.id, e.target.value.toUpperCase())}
                            className={`${baseClass} flex-1 font-mono tracking-wider uppercase ${gstinStatus
                                ? gstinStatus.valid
                                  ? "border-green-500/30 focus:border-green-500/50"
                                  : "border-red-400/30 focus:border-red-400/50"
                                : ""
                              }`}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyGSTIN}
                            className="shrink-0 rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-3 text-xs text-white/60 hover:bg-[#C9A96E]/12 hover:text-white/80 transition-all duration-300 tracking-wide uppercase"
                          >
                            Verify
                          </button>
                        </div>
                        {gstinStatus && (
                          <p className={`mt-2 text-xs ${gstinStatus.valid
                              ? "text-green-400/70"
                              : "text-red-400/70"
                            }`}>
                            {gstinStatus.message}
                          </p>
                        )}
                        <p className="mt-1.5 text-[10px] text-[#6B5A42]">
                          Format: 22AAAAA0000A1Z5 (15 characters, uppercase)
                        </p>
                      </div>
                    )}

                    {field.type === "select" && (
                      <select
                        value={formValues[field.id] || ""}
                        onChange={(e) => setValue(field.id, e.target.value)}
                        className={baseClass}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#1A1714]">{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === "file" && (
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFile(field.id, e.target.files?.[0] || null)}
                        className="text-sm text-[#8B7355] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white/60 hover:file:bg-white/20"
                      />
                    )}

                    {field.type === "multifile" && (
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => setFile(field.id, e.target.files)}
                        className="text-sm text-[#8B7355] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white/60 hover:file:bg-white/20"
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-2">
              <button
                onClick={handleSkip}
                className="px-5 py-3 rounded-xl border border-[#C9A96E]/12 text-[#8B7355] text-sm hover:text-white/70 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-3 rounded-xl bg-[#C9A96E] text-[#0D0D0D] text-sm font-medium hover:bg-[#B8944F] transition-colors"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
