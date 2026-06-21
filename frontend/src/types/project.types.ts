// ─── Project Status & Professional Roles ─────────────────────────────────────

export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "published"
  | "open"
  | "completed"
  | "cancelled"
  | "BID_ACCEPTED"
  | "ADVANCE_PAID"
  | "ESCROW_ACTIVE"
  | "AWAITING_CLIENT_APPROVAL"
  | "FINAL_PAYMENT_PENDING"
  | "FINAL_PAYMENT_RECEIVED"
  | "RELEASED"

export type ProfessionalRole =
  | "architect"
  | "contractor"
  | "interior_designer"
  | "exterior_designer"
  | "autocad_designer"
  | "structural_designer"
  | "landscape_designer"
  | "threeD_Visualizer"
  | "mechanical_Visualizer"
  | "vastu_consultant"

export const PROFESSIONAL_ROLE_LABELS: Record<ProfessionalRole, string> = {
  architect: "Architect",
  contractor: "Contractor",
  interior_designer: "Interior Designer",
  exterior_designer: "Exterior Designer",
  autocad_designer: "AutoCAD Designer",
  structural_designer: "Structural Designer",
  landscape_designer: "Landscape Designer",
  threeD_Visualizer: "3D Visualizer",
  mechanical_Visualizer: "Mechanical 3DVisualizer",
  vastu_consultant: "Vastu Consultant",
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  id: number
  title: string
  description: string
  client_id: number
  client_name: string
  status: ProjectStatus

  // Design
  design_type: string
  preferred_style: string
  property_size: number

  // Budget
  budget_min: number
  budget_max: number
  currency: string

  // Location
  country: string
  city: string

  // Timeline
  start_date: string
  completion_date: string

  // Professionals
  required_professionals: ProfessionalRole[]
  additional_skills: string[]

  // Uploads — keyed by professional type + upload category
  attachments: Record<string, string[]>

  // Metadata
  bids_count: number
  views: number
  saved: number
  created_at: string
  updated_at: string
  assigned_professional_id?: number | null
  assigned_professional_name?: string | null
}

// ─── Create / Update DTO ─────────────────────────────────────────────────────

export interface ProjectCreateData {
  title: string
  description?: string
  design_type?: string
  preferred_style?: string
  property_size?: number
  budget_min?: number
  budget_max?: number
  currency?: string
  country?: string
  city?: string
  start_date?: string
  completion_date?: string
  required_professionals?: ProfessionalRole[]
  additional_skills?: string[]
  attachments?: Record<string, string[]>
  status?: ProjectStatus
}

export type ProjectUpdateData = Partial<ProjectCreateData> & { status?: ProjectStatus }

// ─── Bid ─────────────────────────────────────────────────────────────────────

export interface Bid {
  id: number
  project_id: number
  designer_id: number
  designer_name: string
  amount: number
  currency: string
  status: "pending" | "accepted" | "rejected"
  proposal: string
  timeline: string
  portfolio_items: string[]
  created_at: string
  updated_at: string
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

// ─── Client Dashboard ────────────────────────────────────────────────────────

export interface ClientDashboardData {
  projects: Project[]
  stats: {
    active_projects: number
    saved_professionals: number
    pending_quotes: number
  }
  notifications: Notification[]
  recent_activity: {
    type: string
    description: string
    timestamp: string
  }[]
  upcoming_meetings: {
    title: string
    date: string
    time: string
  }[]
}
