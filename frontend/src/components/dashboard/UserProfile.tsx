"use client"

import { useEffect, useState, useRef } from "react"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import type { UserProfile as UserProfileType } from "@/types/user.types"
import StatusBadge from "@/components/ui/StatusBadge"
import type { ProjectStatus } from "@/types/project.types"
import { API_BASE } from "@/lib/api"

interface Props {
  role: "client" | "designer" | "architect" | "contractor"
}

export default function UserProfile({ role }: Props) {
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return ""
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path
    }
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`
  }

  const formatDisplayName = (fullName: string | null | undefined, firstName: string | null | undefined, lastName: string | null | undefined, username: string) => {
    if (fullName) {
      const parts = fullName.trim().split(/\s+/)
      if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
        return parts[0]
      }
      return fullName
    }
    const first = (firstName || "").trim()
    const last = (lastName || "").trim()
    if (first && last) {
      if (first.toLowerCase() === last.toLowerCase()) {
        return first
      }
      return `${first} ${last}`
    }
    return first || last || username
  }

  // Edit form state
  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    contact_phone: "",
    company_name: "",
    address: "",
    skills: "",
    specialization: "",
    experience_years: "",
    portfolio_description: "",
  })

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    setError("")
    try {
      const user = authService.getStoredUser()
      if (!user) return

      const photoUrl = await userService.uploadProfilePhoto(user.id, file)

      // Update local storage stored user so navbar updates
      const updatedUser = { ...user, profile_photo: photoUrl }
      localStorage.setItem("nod_user", JSON.stringify(updatedUser))

      // Also dispatch storage event so layout header notices the change
      window.dispatchEvent(new Event("storage"))

      await loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setUploadingPhoto(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const user = authService.getStoredUser()
      if (!user) return

      const data = await userService.getUserProfile(user.id)
      setProfile(data)

      // Initialize form values
      setFormValues({
        first_name: data.user.first_name || "",
        last_name: data.user.last_name || "",
        full_name: data.profile_details?.full_name || "",
        contact_phone: data.profile_details?.contact_phone || data.user.phone_number || "",
        company_name: data.profile_details?.company_name || "",
        address: data.profile_details?.address || data.profile_details?.office_address || "",
        skills: data.profile_details?.skills || "",
        specialization: data.profile_details?.specialization || "",
        experience_years: String(data.profile_details?.experience_years || data.stats?.experience_years || 0),
        portfolio_description: data.profile_details?.portfolio_description || "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      const user = authService.getStoredUser()
      if (!user) return

      await userService.updateUserProfile(user.id, formValues)
      setShowEditModal(false)
      await loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/60 rounded-full animate-spin" />
          <p className="text-sm text-[#6B5A42] tracking-wide">Loading profile details…</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8B7355]">Profile not found.</p>
      </div>
    )
  }

  const user = profile.user
  const stats = profile.stats
  const details = profile.profile_details || {}

  const formattedDate = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Jan 2025"

  // ── RENDER CLIENT PROFILE ──
  if (role === "client") {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />
        {error && (
          <div className="text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        {/* Client Header Card */}
        <div className="rounded-3xl border border-[#C9A96E]/50 bg-[#1A1714] p-8 flex items-center gap-6">
          <div
            onClick={triggerFileInput}
            className="w-24 h-24 rounded-full overflow-hidden shrink-0 border border-[#C9A96E]/12 relative bg-[#C9A96E]/5 flex items-center justify-center group cursor-pointer"
          >
            {uploadingPhoto ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#C9A96E]/20 border-t-[#C9A96E]/60 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span className="text-[10px] text-white">Upload</span>
              </div>
            )}
            {user.profile_photo ? (
              <img src={getMediaUrl(user.profile_photo)} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-[#6B5A42] font-light font-serif">
                {formatDisplayName(details.full_name, user.first_name, user.last_name, user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h2
                className="text-3xl font-light text-[#F5F0E8] leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {formatDisplayName(details.full_name, user.first_name, user.last_name, user.username)}
              </h2>
              <p className="text-xs text-[#6B5A42] tracking-widest uppercase">Client</p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-6 py-2.5 rounded-xl border border-[#C9A96E]/20 bg-white hover:bg-[#B8944F] text-black text-xs font-medium transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Client Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6 text-center space-y-1">
            <p className="text-[10px] text-[#6B5A42] uppercase tracking-[0.2em]">Projects Posted</p>
            <p className="text-3xl font-light text-[#F5F0E8] font-mono">{stats.projects_posted || 0}</p>
          </div>
          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6 text-center space-y-1">
            <p className="text-[10px] text-[#6B5A42] uppercase tracking-[0.2em]">Professionals Hired</p>
            <p className="text-3xl font-light text-[#F5F0E8] font-mono">{stats.professionals_hired || 0}</p>
          </div>
          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6 text-center space-y-1">
            <p className="text-[10px] text-[#6B5A42] uppercase tracking-[0.2em]">Completed Projects</p>
            <p className="text-3xl font-light text-[#F5F0E8] font-mono">{stats.completed_projects || 0}</p>
          </div>
        </div>

        {/* Client Layout: Active Projects & Saved Professionals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h4
              className="text-xl font-light text-[#F5F0E8] font-serif"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Active Projects
            </h4>
            <div className="space-y-3">
              {profile.active_projects?.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] p-5 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-sm font-medium text-[#F5F0E8] mb-1">{proj.title}</h5>
                    <p className="text-xs text-[#6B5A42]">Assigned to {proj.assigned_professional_name}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={proj.status as ProjectStatus} />
                    <p className="text-[10px] text-[#6B5A42] mt-1.5">Completion • {proj.completion_date}</p>
                  </div>
                </div>
              ))}
              {(!profile.active_projects || profile.active_projects.length === 0) && (
                <p className="text-xs text-[#6B5A42] italic">No active projects currently.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4
              className="text-xl font-light text-[#F5F0E8] font-serif"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Saved Professionals
            </h4>
            <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-5 divide-y divide-white/5 space-y-4">
              {profile.saved_professionals?.map((prof, index) => (
                <div key={prof.id} className={`flex items-center justify-between ${index > 0 ? "pt-4" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C9A96E]/6 bg-[#C9A96E]/5">
                      <img src={getMediaUrl(prof.profile_photo) || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80`} alt={prof.full_name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-[#F5F0E8]">{prof.full_name}</h5>
                      <p className="text-[10px] text-[#6B5A42]">{prof.role}</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-white/60 flex items-center gap-1">
                    <span>{prof.rating.toFixed(1)}</span>
                    <span className="text-[#8B7355]">★</span>
                  </div>
                </div>
              ))}
              {(!profile.saved_professionals || profile.saved_professionals.length === 0) && (
                <p className="text-xs text-[#6B5A42] italic">No saved professionals.</p>
              )}
            </div>
          </div>
        </div>

        {/* Client Account Info */}
        <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6 space-y-4">
          <h4
            className="text-lg font-light text-[#F5F0E8] font-serif"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-xs">
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-[#6B5A42] w-24">Email :</span>
              <span className="text-white/60">{user.email}</span>
            </div>
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-[#6B5A42] w-24">Phone No :</span>
              <span className="text-white/60">{details.contact_phone || "Not provided"}</span>
            </div>
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-[#6B5A42] w-24">Location :</span>
              <span className="text-white/60">{details.address || "Not provided"}</span>
            </div>
            <div className="flex justify-between md:justify-start gap-4">
              <span className="text-[#6B5A42] w-24">Member Since :</span>
              <span className="text-white/60">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && renderEditModal()}
      </div>
    )
  }

  // ── RENDER PROFESSIONAL PROFILE (designer, architect, contractor) ──
  const skillTags = (details.skills || details.specialization || details.project_types || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)

  const defaultRoleTitle = role === "designer" ? "Interior Designer" : role === "architect" ? "Lead Architect" : "General Contractor"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />
      {error && (
        <div className="text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Professional Header Card */}
      <div className="rounded-3xl border border-[#C9A96E]/80 bg-[#1A1714] p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div
            onClick={triggerFileInput}
            className="w-24 h-24 rounded-full overflow-hidden shrink-0 border border-[#C9A96E]/12 relative bg-[#C9A96E]/5 flex items-center justify-center group cursor-pointer"
          >
            {uploadingPhoto ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#C9A96E]/20 border-t-[#C9A96E]/60 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <span className="text-[10px] text-white">Upload</span>
              </div>
            )}
            {user.profile_photo ? (
              <img src={getMediaUrl(user.profile_photo)} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-[#6B5A42] font-light font-serif">
                {formatDisplayName(details.full_name, user.first_name, user.last_name, user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="space-y-3 text-center md:text-left">
            <div>
              <h2
                className="text-3xl font-light text-[#F5F0E8] leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {formatDisplayName(details.full_name, user.first_name, user.last_name, user.username)}
              </h2>
              <p className="text-xs text-white/60">
                {defaultRoleTitle} {details.specialization ? `• ${details.specialization.split(",")[0]}` : ""}
              </p>
            </div>
            {details.portfolio_description && (
              <p className="text-xs text-[#8B7355] max-w-md leading-relaxed">
                {details.portfolio_description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end justify-between self-stretch shrink-0 gap-4">
          <div className="flex gap-6 text-center md:text-right">
            <div>
              <p className="text-lg font-light text-[#F5F0E8] font-mono">{stats.total_projects || 0}</p>
              <p className="text-[9px] uppercase tracking-wider text-[#6B5A42]">Projects</p>
            </div>
            <div>
              <p className="text-lg font-light text-[#F5F0E8] font-mono">{(stats.average_rating || 0).toFixed(1)}</p>
              <p className="text-[9px] uppercase tracking-wider text-[#6B5A42]">Rating</p>
            </div>
            <div>
              <p className="text-lg font-light text-[#F5F0E8] font-mono">{details.experience_years || stats.experience_years || 0} Years</p>
              <p className="text-[9px] uppercase tracking-wider text-[#6B5A42]">Experience</p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-6 py-2.5 rounded-xl bg-white border border-[#C9A96E]/40 hover:bg-[#B8944F] text-black text-xs font-medium transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Professional Layout: About & Specializations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] p-6 space-y-4">
          <h4
            className="text-lg font-light text-[#F5F0E8] font-serif"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            About
          </h4>
          <p className="text-xs text-[#8B7355] leading-relaxed">
            {details.portfolio_description || "Specialized in luxury residential architecture and premium interior planning with emphasis on spatial flow and lighting experience."}
          </p>
        </div>

        <div className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] p-6 space-y-4">
          <h4
            className="text-lg font-light text-[#F5F0E8] font-serif"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Specializations
          </h4>
          <div className="flex flex-wrap gap-2">
            {skillTags.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg border border-[#C9A96E]/6 bg-[#C9A96E]/3 text-[11px] text-white/60"
              >
                {tag}
              </span>
            ))}
            {skillTags.length === 0 && (
              <p className="text-xs text-[#6B5A42] italic">No specializations specified.</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Layout: Portfolio */}
      <div className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] p-6 space-y-4">
        <h4
          className="text-lg font-light text-[#F5F0E8] font-serif"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Portfolio
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {profile.portfolio?.map((item) => (
            <div key={item.id} className="relative rounded-xl overflow-hidden border border-[#C9A96E]/6 aspect-[4/3] group bg-[#C9A96E]/5">
              <img src={getMediaUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                <span className="text-xs font-medium text-white/80">{item.title}</span>
              </div>
            </div>
          ))}
          {(!profile.portfolio || profile.portfolio.length === 0) && (
            <p className="text-xs text-[#6B5A42] italic col-span-3 text-center py-6">No portfolio items added yet.</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && renderEditModal()}
    </div>
  )

  // ── SHARED EDIT MODAL ──
  function renderEditModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-8 max-h-[90vh] overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <h3
              className="text-2xl font-light text-[#F5F0E8] font-serif"
              style={{ fontFamily: "'Cormorant Garamond', serif' " }}
            >
              Edit Profile Information
            </h3>
            <button
              onClick={() => setShowEditModal(false)}
              className="w-8 h-8 rounded-full border border-[#C9A96E]/12 flex items-center justify-center hover:bg-[#C9A96E]/5 text-[#8B7355] hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formValues.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formValues.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Display / Business Name</label>
              <input
                type="text"
                value={formValues.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  value={formValues.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={formValues.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Address / Office Address</label>
              <textarea
                rows={2}
                value={formValues.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none resize-none"
              />
            </div>

            {role !== "client" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">
                      {role === "contractor" ? "Project Types (comma-separated)" : "Specialization / Expertise (comma-separated)"}
                    </label>
                    <input
                      type="text"
                      value={formValues.specialization}
                      onChange={(e) => handleInputChange("specialization", e.target.value)}
                      placeholder="e.g. Interior Design, Landscaping"
                      className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">
                      {role === "contractor" ? "Team Size" : "Years of Experience"}
                    </label>
                    <input
                      type="number"
                      value={formValues.experience_years}
                      onChange={(e) => handleInputChange("experience_years", e.target.value)}
                      className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Skills / Tech Stacks (comma-separated)</label>
                  <input
                    type="text"
                    value={formValues.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                    placeholder="e.g. AutoCAD, Space Planning"
                    className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Portfolio Description / About Description</label>
                  <textarea
                    rows={3}
                    value={formValues.portfolio_description}
                    onChange={(e) => handleInputChange("portfolio_description", e.target.value)}
                    className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none resize-none"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[#C9A96E]/6">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#C9A96E]/12 text-[#8B7355] text-xs hover:text-white/70 hover:bg-[#B8944F] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#C9A96E]/80 text-[#0D0D0D] text-xs font-semibold hover:bg-[#B8944F] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}
