import type { ProjectStatus } from "@/types/project.types"

const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft:                    { label: "Draft",                    bg: "bg-[#C9A96E]/5",        text: "text-[#8B7355]",     dot: "bg-[#C9A96E]/30" },
  in_progress:              { label: "In Progress",              bg: "bg-amber-500/10",       text: "text-amber-400/70",  dot: "bg-amber-400/60" },
  published:                { label: "Published",                bg: "bg-emerald-500/10",     text: "text-emerald-400/70", dot: "bg-emerald-400/60" },
  open:                     { label: "Open",                     bg: "bg-emerald-500/10",     text: "text-emerald-400/70", dot: "bg-emerald-400/60" },
  completed:                { label: "Completed",                bg: "bg-blue-500/10",        text: "text-blue-400/70",   dot: "bg-blue-400/60" },
  cancelled:                { label: "Cancelled",                bg: "bg-red-500/10",         text: "text-red-400/70",    dot: "bg-red-400/60" },
  BID_ACCEPTED:             { label: "Bid Accepted",             bg: "bg-indigo-500/10",      text: "text-indigo-400/70", dot: "bg-indigo-400/60" },
  ADVANCE_PAID:             { label: "Advance Paid",             bg: "bg-violet-500/10",      text: "text-violet-400/70", dot: "bg-violet-400/60" },
  ESCROW_ACTIVE:            { label: "Escrow Active",            bg: "bg-emerald-500/10",     text: "text-emerald-400/70", dot: "bg-emerald-400/60" },
  AWAITING_CLIENT_APPROVAL: { label: "Awaiting Client Approval", bg: "bg-purple-500/10",      text: "text-purple-400/70", dot: "bg-purple-400/60" },
}

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wide uppercase ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}