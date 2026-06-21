"use client"

import { useState, useEffect } from "react"
import type { Project, ProjectCreateData, ProjectUpdateData, ProfessionalRole, ProjectStatus } from "@/types/project.types"
import { PROFESSIONAL_ROLE_LABELS } from "@/types/project.types"
import TagInput from "@/components/ui/TagInput"
import FileUploadZone from "@/components/ui/FileUploadZone"
import StatusBadge from "@/components/ui/StatusBadge"

// ─── Professional Upload Configuration ───────────────────────────────────────

type UploadField = { id: string; label: string; multiple: boolean; accept: string }

const PROFESSIONAL_UPLOADS: Record<ProfessionalRole, UploadField[]> = {
  architect: [
    // { id: "site_plan", label: "Site Plan", multiple: false, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "floor_plan", label: "Floor Plan", multiple: false, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "Reference_Plans", label: "Reference Plans", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
    // { id: "concept_plans", label: "Concept Plans", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "reference_images", label: "Reference Images", multiple: true, accept: ".jpg,.jpeg,.png" },
  ],
  contractor: [
    // { id: "boq", label: "Bill of Quantities (BOQ)", multiple: false, accept: ".pdf" },
    { id: "construction_plan", label: "Construction Plan", multiple: false, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "reference_docs", label: "Reference Documents / Images", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  interior_designer: [
    { id: "layout_plan", label: "Existing Layout Plan", multiple: false, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "site_photos", label: "Site Photographs", multiple: true, accept: ".jpg,.jpeg,.png" },
    { id: "reference_images", label: "Reference Images", multiple: true, accept: ".jpg,.jpeg,.png" },
  ],
  exterior_designer: [
    { id: "exterior_photos", label: "Exterior Site Photographs", multiple: true, accept: ".jpg,.jpeg,.png" },
    { id: "floor_plan", label: "Floor Plan", multiple: false, accept: ".pdf,.jpg,.jpeg,.png" },
    // { id: "elevation", label: "Elevation Drawings", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "building_plan", label: "Building Plan", multiple: true, accept: ".pdf" },
    { id: "reference_images", label: "Reference Images", multiple: true, accept: ".jpg,.jpeg,.png" },
  ],
  autocad_designer: [
    { id: "site_photos", label: "Site Photographs", multiple: true, accept: ".jpg,.jpeg,.png" },
    { id: "concept_sketches", label: "Concept Sketches / Compositions", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "reference_files", label: "Reference Files", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  structural_designer: [
    { id: "floor_plans", label: "Floor Plans", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
    // { id: "load_calculations", label: "Load Calculations", multiple: true, accept: ".pdf" },
    // { id: "reference_docs", label: "Reference Documents", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  landscape_designer: [
    { id: "site_layout", label: "Site Layout(Optional)", multiple: false, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "landscape_photos", label: "Landscape Photographs", multiple: true, accept: ".jpg,.jpeg,.png" },
    { id: "reference_images", label: "Reference Images", multiple: true, accept: ".jpg,.jpeg,.png" },
  ],
  threeD_Visualizer: [
    { id: "floor_plan", label: "Floor Plan", multiple: true, accept: ".pdf" },
    { id: "requirement_docs", label: "Requirement Documents / Images", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  mechanical_Visualizer: [
    { id: "reference_photos", label: "Reference Photos", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "reference_docs", label: "Reference Documents", multiple: true, accept: ".pdf,.jpg,.jpeg,.png" },
  ],
  vastu_consultant: [
    { id: "property_layout", label: "Property Layout", multiple: false, accept: ".pdf,.jpg,.jpeg,.png" },
    { id: "site_photos", label: "Site Photographs", multiple: true, accept: ".jpg,.jpeg,.png" },
  ],
}

const SKILL_SUGGESTIONS = [
  "3D Visualization", "BIM Modeling", "Revit Expert", "Sustainable Design",
  "Lighting Design", "Smart Home", "Green Building", "LEED Certification",
  "Universal Design", "Heritage Restoration", "Acoustic Design", "Fire Safety",
]

const DESIGN_TYPES = [
  "Residential", "Commercial", "Office", "Retail", "Hospitality",
  "Healthcare", "Educational", "Industrial", "Mixed Use", "Renovation",
  "Interior Design Only", "Exterior Design Only",
]

const STYLES = [
  "Modern", "Contemporary", "Minimalist", "Luxury",
  "Industrial", "Scandinavian", "Traditional", "Classic",
]

// ─── Component ───────────────────────────────────────────────────────────────

interface ProjectFormProps {
  project?: Project | null
  currency?: string
  onSave: (data: ProjectCreateData | ProjectUpdateData) => Promise<void>
  onPublish?: () => Promise<void>
  onBack: () => void
}

export default function ProjectForm({ project, currency = "USD", onSave, onPublish, onBack }: ProjectFormProps) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ── Form State ──
  const [title, setTitle] = useState(project?.title || "")
  const [description, setDescription] = useState(project?.description || "")
  const [designType, setDesignType] = useState(project?.design_type || "")
  const [style, setStyle] = useState(project?.preferred_style || "")
  const [propertySize, setPropertySize] = useState(project?.property_size?.toString() || "")
  const [budgetMin, setBudgetMin] = useState(project?.budget_min?.toString() || "")
  const [budgetMax, setBudgetMax] = useState(project?.budget_max?.toString() || "")
  const [budgetType, setBudgetType] = useState<"overall" | "per_sqft">("overall")
  const [country, setCountry] = useState(project?.country || "")
  const [city, setCity] = useState(project?.city || "")
  const [startDate, setStartDate] = useState(project?.start_date || "")
  const [completionDate, setCompletionDate] = useState(project?.completion_date || "")
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalRole | "">
    (project?.required_professionals?.[0] || "")
  const [additionalSkills, setAdditionalSkills] = useState<string[]>(project?.additional_skills || [])
  const [attachments, setAttachments] = useState<Record<string, string[]>>(project?.attachments || {})
  const [conceptDescription, setConceptDescription] = useState("")

  // Sync when project prop changes
  useEffect(() => {
    if (project) {
      setTitle(project.title || "")
      setDescription(project.description || "")
      setDesignType(project.design_type || "")
      setStyle(project.preferred_style || "")
      setPropertySize(project.property_size?.toString() || "")
      setBudgetMin(project.budget_min?.toString() || "")
      setBudgetMax(project.budget_max?.toString() || "")
      setCountry(project.country || "")
      setCity(project.city || "")
      setStartDate(project.start_date || "")
      setCompletionDate(project.completion_date || "")
      setSelectedProfessional(project.required_professionals?.[0] || "")
      setAdditionalSkills(project.additional_skills || [])
      setAttachments(project.attachments || {})
    }
  }, [project?.id])

  const selectProfessional = (role: ProfessionalRole) => {
    setSelectedProfessional(role)
  }

  const handleUpload = (professionalRole: ProfessionalRole, uploadId: string, urls: string[]) => {
    const key = `${professionalRole}_${uploadId}`
    setAttachments((prev) => ({ ...prev, [key]: urls }))
  }

  const selectedProfessionals: ProfessionalRole[] = selectedProfessional ? [selectedProfessional] : []

  const buildData = (customStatus?: ProjectStatus): ProjectCreateData => ({
    title,
    description,
    design_type: designType,
    preferred_style: style,
    property_size: propertySize ? Number(propertySize) : undefined,
    budget_min: budgetMin ? Number(budgetMin) : undefined,
    budget_max: budgetMax ? Number(budgetMax) : undefined,
    currency,
    country,
    city,
    start_date: startDate,
    completion_date: completionDate,
    required_professionals: selectedProfessionals,
    additional_skills: additionalSkills,
    attachments,
    status: customStatus || project?.status || "draft",
  })

  const validateForm = (): string | null => {
    if (!title.trim()) return "Project name is required"
    if (!description.trim()) return "Project description is required"
    if (!designType) return "Please select a design type"
    if (!style) return "Please select a preferred style"

    // Property Size validation (integer or float)
    if (!propertySize) return "Property size is required"
    const size = Number(propertySize)
    if (isNaN(size) || size <= 0) {
      return "Property size must be a valid positive number (integer or float)."
    }

    // Budget validation (only integers)
    if (!budgetMin || !budgetMax) return "Budget range is required"
    const minB = Number(budgetMin)
    const maxB = Number(budgetMax)
    if (isNaN(minB) || !Number.isInteger(minB) || minB < 1) {
      return "Min Budget must be a whole number (integer) greater than or equal to 1."
    }
    if (isNaN(maxB) || !Number.isInteger(maxB) || maxB < 1) {
      return "Max Budget must be a whole number (integer) greater than or equal to 1."
    }
    if (maxB < minB) {
      return "Max Budget cannot be less than Min Budget."
    }

    // Country & City validation (only characters)
    if (!country.trim()) return "Country is required"
    const charRegex = /^[a-zA-Z\s\-.,']+$/
    if (!charRegex.test(country.trim())) {
      return "Country must only contain letters, spaces, hyphens, periods, or apostrophes."
    }

    if (!city.trim()) return "City / Address is required"
    if (!charRegex.test(city.trim())) {
      return "City / Address must only contain letters, spaces, hyphens, periods, or apostrophes."
    }

    if (!startDate || !completionDate) return "Timeline dates are required"
    if (!selectedProfessional) return "Please select a professional"

    return null
  }

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError("Project name is required to save a draft")
      return
    }
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await onSave(buildData("draft"))
      setSuccess("Draft saved successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (selectedProfessional) {
      const requiredUploads = PROFESSIONAL_UPLOADS[selectedProfessional] || []
      const missingFiles = requiredUploads.some((upload) => {
        const key = `${selectedProfessional}_${upload.id}`
        const files = attachments[key]
        return !files || files.length === 0
      })
      if (missingFiles) {
        setError("Upload all files first")
        return
      }
    }

    if (selectedProfessional === "mechanical_Visualizer" && !conceptDescription.trim()) {
      setError("Concept description is required for Mechanical Visualizer")
      return
    }

    setSaving(true)
    setError("")
    try {
      await onSave(buildData("open"))
      if (onPublish) await onPublish()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish")
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/4 px-4 py-3 text-sm text-[#F5F0E8] placeholder-[#8B7355]/50 outline-none transition-all duration-300 focus:border-[#C9A96E]/30 focus:bg-[#C9A96E]/[0.08] hover:border-[#C9A96E]/15"

  const steps = [
    { num: 1, label: "General Info" },
    { num: 2, label: "Uploads" },
    { num: 3, label: "Review" },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onBack} className="text-[#6B5A42] text-xs hover:text-[#8B7355] transition-colors mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Projects
          </button>
          <h2
            className="text-3xl font-light text-black"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {project ? "Edit Project" : "New Project"}
          </h2>
        </div>
        {project && <StatusBadge status={project.status} />}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 ${step === s.num ? "text-black" : "text-[#6B5A42]"} transition-colors`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-300 ${step === s.num ? "bg-[#C9A96E] text-[#0D0D0D]" : step > s.num ? "bg-white/15 text-[#8B7355]" : "bg-[#C9A96E]/5 text-[#6B5A42]"
                }`}>
                {step > s.num ? "✓" : s.num}
              </div>
              <span className="text-[10px] tracking-wide uppercase hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-black/40" />}
          </div>
        ))}
      </div>

      {/* Error / Success */}
      {error && (
        <div className="mb-5 text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 text-xs text-[#8AA86E] bg-emerald-400/5 border border-emerald-400/10 rounded-xl px-4 py-2.5">
          {success}
        </div>
      )}

      {/* ── STEP 1: General Info ── */}
      {step === 1 && (
        <div className="space-y-6 rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-6">
          {/* Project basics */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Project Name *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Modern Villa Renovation" className={inputClass} />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your project..." className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Design Type</label>
              <select value={designType} onChange={(e) => setDesignType(e.target.value)} className={inputClass}>
                <option value="" className="bg-[#1A1714]">Select type</option>
                {DESIGN_TYPES.map((t) => <option key={t} value={t} className="bg-[#1A1714]">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Preferred Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputClass}>
                <option value="" className="bg-[#1A1714]">Select style</option>
                {STYLES.map((s) => <option key={s} value={s} className="bg-[#1A1714]">{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Property Size (sq ft)</label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={propertySize}
              onChange={(e) => setPropertySize(e.target.value)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              placeholder="e.g. 2500"
              className={inputClass}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/6" />
            <span className="text-[12px] text-black tracking-[0.2em] uppercase">Budget & Location</span>
            <div className="h-px flex-1 bg-white/6" />
          </div>

          {/* Budget Type Toggle */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-3">Budget Type *</label>
            <div className="flex rounded-xl border border-[#C9A96E]/12 overflow-hidden">
              <button
                type="button"
                onClick={() => setBudgetType("overall")}
                className={`flex-1 py-2.5 text-xs transition-all duration-300 ${budgetType === "overall"
                  ? "bg-[#C9A96E] text-[#0D0D0D] font-medium"
                  : "bg-transparent text-[#8B7355] hover:text-[#B8A88A]"
                  }`}
              >
                Overall Budget
              </button>
              <button
                type="button"
                onClick={() => setBudgetType("per_sqft")}
                className={`flex-1 py-2.5 text-xs transition-all duration-300 ${budgetType === "per_sqft"
                  ? "bg-[#C9A96E] text-[#0D0D0D] font-medium"
                  : "bg-transparent text-[#8B7355] hover:text-[#B8A88A]"
                  }`}
              >
                Per Sq. Ft.
              </button>
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">
                Min Budget {budgetType === "per_sqft" ? "/ sq ft" : ""} ({currency}) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                placeholder="e.g. 50000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">
                Max Budget {budgetType === "per_sqft" ? "/ sq ft" : ""} ({currency}) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                placeholder="e.g. 200000"
                className={inputClass}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || /^[a-zA-Z\s\-.,']*$/.test(val)) {
                    setCountry(val)
                  }
                }}
                placeholder="e.g. India"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">City / Address</label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || /^[a-zA-Z\s\-.,']*$/.test(val)) {
                    setCity(val)
                  }
                }}
                placeholder="e.g. Mumbai"
                className={inputClass}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Expected Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Expected Completion</label>
              <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/6" />
            <span className="text-[12px] text-black tracking-[0.2em] uppercase">Professionals</span>
            <div className="h-px flex-1 bg-white/6" />
          </div>

          {/* Required Professional — single select */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-3">Select Professional *</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PROFESSIONAL_ROLE_LABELS) as ProfessionalRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => selectProfessional(role)}
                  className={`rounded-full px-3.5 py-2 text-xs transition-all duration-300 ${selectedProfessional === role
                    ? "bg-[#C9A96E] text-[#0D0D0D]"
                    : "bg-[#C9A96E]/5 text-[#8B7355] border border-[#C9A96E]/10 hover:bg-[#C9A96E]/12 hover:text-[#B8A88A]"
                    }`}
                >
                  {PROFESSIONAL_ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Skills */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Additional Required Skills</label>
            <TagInput
              value={additionalSkills}
              onChange={setAdditionalSkills}
              placeholder="e.g. 3D Visualization, BIM Modeling..."
              suggestions={SKILL_SUGGESTIONS}
            />
          </div>

          {/* Next */}
          <div className="flex justify-between pt-2">
            <button onClick={handleSaveDraft} disabled={saving} className="px-5 py-3 rounded-xl border border-[#C9A96E]/12 text-[#8B7355] text-sm hover:text-white/70 hover:bg-[#C0A06E] transition-colors disabled:opacity-40">
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => {
                if (!title.trim()) { setError("Project name is required"); return }
                if (!description.trim()) { setError("Project description is required"); return }
                if (!designType) { setError("Please select a design type"); return }
                if (!style) { setError("Please select a preferred style"); return }
                if (!propertySize) { setError("Property size is required"); return }
                if (!budgetMin || !budgetMax) { setError("Budget range is required"); return }
                if (!country) { setError("Country is required"); return }
                if (!city) { setError("City / Address is required"); return }
                if (!startDate || !completionDate) { setError("Timeline dates are required"); return }
                if (!selectedProfessional) { setError("Please select a professional"); return }
                setError("")
                setStep(2)
              }}
              className="px-6 py-3 rounded-xl bg-[#C9A96E]/80 text-[#0D0D0D] text-sm font-medium hover:bg-[#C9A96E] transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Professional Uploads ── */}
      {step === 2 && (
        <div className="space-y-6">
          {selectedProfessionals.length === 0 ? (
            <div className="rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] p-8 text-center">
              <p className="text-[#6B5A42] text-sm mb-2">No professional selected</p>
              <p className="text-[#5A4A35] text-xs">Go back to Step 1 and select a professional.</p>
              <button onClick={() => setStep(1)} className="mt-4 text-xs text-[#8B7355] hover:text-[#B8A88A] underline underline-offset-4 transition-colors">
                ← Back to General Info
              </button>
            </div>
          ) : (
            selectedProfessionals.map((role) => {
              const uploads = PROFESSIONAL_UPLOADS[role]
              if (!uploads) return null
              return (
                <div key={role} className="rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] p-6">
                  <h3 className="text-lg font-light text-[#F5F0E8] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {PROFESSIONAL_ROLE_LABELS[role]}
                  </h3>
                  <p className="text-xs text-[#6B5A42] mb-5">Upload required documents for {PROFESSIONAL_ROLE_LABELS[role].toLowerCase()}</p>
                  <div className="space-y-5">
                    {uploads.map((upload) => (
                      <FileUploadZone
                        key={`${role}_${upload.id}`}
                        label={upload.label}
                        category={`${role}_${upload.id}`}
                        multiple={upload.multiple}
                        accept={upload.accept}
                        existingUrls={attachments[`${role}_${upload.id}`] || []}
                        onUpload={(urls) => handleUpload(role, upload.id, urls)}
                      />
                    ))}

                    {/* Concept Description — only for Mechanical Visualizer */}
                    {role === "mechanical_Visualizer" && (
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-black mb-2">Concept Description *</label>
                        <textarea
                          rows={4}
                          value={conceptDescription}
                          onChange={(e) => setConceptDescription(e.target.value)}
                          placeholder="Describe the mechanical visualization concept in detail..."
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {/* Note */}
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
            <span className="text-amber-400/60 text-sm mt-0.5">📌</span>
            <p className="text-xs text-black/80 leading-relaxed">
              Keep Note in the photograph and documents for better understanding
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-[#C9A96E]/12 text-[#8B7355] text-sm hover:text-white/70 transition-colors">
              ← Back
            </button>
            <div className="flex gap-3">
              <button onClick={handleSaveDraft} disabled={saving} className="px-5 py-3 rounded-xl border border-[#C9A96E]/12 text-[#8B7355] text-sm hover:text-white/70 transition-colors disabled:opacity-40">
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={() => {
                  if (selectedProfessional) {
                    const requiredUploads = PROFESSIONAL_UPLOADS[selectedProfessional] || []
                    const missingFiles = requiredUploads.some((upload) => {
                      const key = `${selectedProfessional}_${upload.id}`
                      const files = attachments[key]
                      return !files || files.length === 0
                    })
                    if (missingFiles) {
                      setError("Upload all files first")
                      return
                    }
                  }

                  if (selectedProfessional === "mechanical_Visualizer" && !conceptDescription.trim()) {
                    setError("Concept description is required for Mechanical Visualizer")
                    return
                  }
                  setError("")
                  setStep(3)
                }}
                className="px-6 py-3 rounded-xl bg-[#C9A96E] text-[#0D0D0D] text-sm font-medium hover:bg-[#B8944F] transition-colors"
              >
                Review →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review & Publish ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] p-6 space-y-5">
            <h3 className="text-xl font-light text-black" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Project Summary
            </h3>

            {/* Summary grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Project Name", value: title },
                { label: "Design Type", value: designType },
                { label: "Preferred Style", value: style },
                { label: "Property Size", value: propertySize ? `${propertySize} sq ft` : "—" },
                { label: "Budget Range", value: budgetMin && budgetMax ? `${currency} ${Number(budgetMin).toLocaleString()} – ${Number(budgetMax).toLocaleString()} ${budgetType === "per_sqft" ? "/ sq ft" : "(overall)"}` : "—" },
                { label: "Location", value: [city, country].filter(Boolean).join(", ") || "—" },
                { label: "Start Date", value: startDate || "—" },
                { label: "Completion", value: completionDate || "—" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B5A42] mb-1">{item.label}</p>
                  <p className="text-black/80">{item.value || "—"}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {description && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B5A42] mb-1">Description</p>
                <p className="text-sm text-[#8B7355] leading-relaxed">{description}</p>
              </div>
            )}

            {/* Professionals */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B5A42] mb-2">Selected Professional</p>
              <div className="flex flex-wrap gap-2">
                {selectedProfessional ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#C9A96E]/5 text-xs text-[#8B7355] border border-[#C9A96E]/10">
                    {PROFESSIONAL_ROLE_LABELS[selectedProfessional]}
                  </span>
                ) : (
                  <span className="text-xs text-[#6B5A42]">None selected</span>
                )}
              </div>
            </div>

            {/* Skills */}
            {additionalSkills.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B5A42] mb-2">Additional Skills</p>
                <div className="flex flex-wrap gap-2">
                  {additionalSkills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-[#C9A96E]/5 text-xs text-[#8B7355] border border-[#C9A96E]/8">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Upload count */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B5A42] mb-1">Attachments</p>
              <p className="text-sm text-[#8B7355]">
                {Object.values(attachments).flat().length} file(s) uploaded
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-[#C9A96E]/20 text-[#8B7355] text-sm hover:text-white/70 hover:bg-[#C9A96E] transition-colors">
              ← Back
            </button>
            <div className="flex gap-3">
              <button onClick={handleSaveDraft} disabled={saving} className="px-5 py-3 rounded-xl border border-[#C9A96E]/20 text-[#8B7355] text-sm hover:text-white/70 hover:bg-[#C9A96E] transition-colors disabled:opacity-40">
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-[#F5F0E8] text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40"
              >
                {saving ? "Publishing..." : "🚀 Publish Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
