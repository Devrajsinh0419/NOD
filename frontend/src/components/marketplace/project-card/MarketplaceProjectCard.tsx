import type { Project } from "@/types/project.types"
import { PROFESSIONAL_ROLE_LABELS } from "@/types/project.types"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatToUserCurrency } from "@/utils/currency"

interface MarketplaceProjectCardProps {
  project: Project
  onView?: (id: number) => void
  onApply?: (id: number) => void
}

export default function MarketplaceProjectCard({ project, onView, onApply }: MarketplaceProjectCardProps) {
  const budgetLabel =
    project.budget_min && project.budget_max
      ? `${formatToUserCurrency(project.budget_min, project.currency || "USD")} – ${formatToUserCurrency(project.budget_max, project.currency || "USD")}`
      : null

  const locationLabel = [project.city, project.country].filter(Boolean).join(", ")

  const timelineLabel =
    project.start_date && project.completion_date
      ? `${new Date(project.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} → ${new Date(project.completion_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
      : null

  return (
    <div className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] overflow-hidden hover:border-[#C9A96E]/18 hover:bg-[#221F1A] transition-all duration-300 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1 pr-3">
            <h3
              className="text-lg font-light text-black group-hover: transition-colors truncate"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {project.title}
            </h3>
            {project.client_name && (
              <p className="text-[10px] text-[#6B5A42] tracking-wide mt-0.5">by {project.client_name}</p>
            )}
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-[#6B5A42] leading-relaxed mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.design_type && (
            <span className="px-2.5 py-1 rounded-lg bg-[#C9A96E]/5 text-[10px] text-[#8B7355] border border-[#C9A96E]/8">
              {project.design_type}
            </span>
          )}
          {project.preferred_style && (
            <span className="px-2.5 py-1 rounded-lg bg-[#C9A96E]/5 text-[10px] text-[#8B7355] border border-[#C9A96E]/8">
              {project.preferred_style}
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {budgetLabel && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#6B5A42] mb-0.5">Budget</p>
              <p className="text-xs text-[#8B7355] font-medium">{budgetLabel}</p>
            </div>
          )}
          {locationLabel && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#6B5A42] mb-0.5">Location</p>
              <p className="text-xs text-[#8B7355]">{locationLabel}</p>
            </div>
          )}
          {timelineLabel && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#6B5A42] mb-0.5">Timeline</p>
              <p className="text-xs text-[#8B7355]">{timelineLabel}</p>
            </div>
          )}
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#6B5A42] mb-0.5">Proposals</p>
            <p className="text-xs text-[#8B7355]">{project.bids_count || 0} received</p>
          </div>
        </div>

        {/* Required Professionals */}
        {project.required_professionals && project.required_professionals.length > 0 && (
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#6B5A42] mb-2">Looking For</p>
            <div className="flex flex-wrap gap-1.5">
              {project.required_professionals.map((r) => (
                <span key={r} className="px-2 py-0.5 rounded-md bg-white/3 text-[10px] text-[#6B5A42] border border-[#C9A96E]/6">
                  {PROFESSIONAL_ROLE_LABELS[r]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[10px] text-[#5A4A35] border-t border-[#C9A96E]/20 pt-3">
          <span>Posted {new Date(project.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
        </div>
      </div>

      {/* Action buttons */}
      {(onView || onApply) && (
        <div className="flex border-t border-[#C9A96E]/20">
          {onView && (
            <button
              onClick={() => onView(project.id)}
              className="flex-1 py-3 text-xs text-[#8B7355] hover:text-white/60 hover:bg-[#C9A96E] transition-all duration-300 border-r border-[#C9A96E]/20"
            >
              View Details
            </button>
          )}
          {onApply && (
            <button
              onClick={() => onApply(project.id)}
              className="flex-1 py-3 text-xs text-[#8B7355] hover:text-white hover:bg-[#C9A96E] transition-all duration-300 font-medium"
            >
              Apply Now
            </button>
          )}
        </div>
      )}
    </div>
  )
}
