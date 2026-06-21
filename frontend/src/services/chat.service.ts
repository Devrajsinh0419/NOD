import { apiFetch } from "@/lib/api"
import type { ApiResponse } from "@/types/auth.types"
import type { ChatRoom, ChatMessage } from "@/types/chat.types"

export interface Meeting {
  id: number
  project_id: number
  client_id: number
  professional_id: number
  meeting_url: string
  started_at: string | null
  ended_at: string | null
  duration: number
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED'
  created_at: string
}

export interface WarningStatus {
  warning_count: number
  restricted: boolean
}

export const chatService = {
  /** Get all active chat rooms */
  async getRooms(): Promise<ChatRoom[]> {
    const res = await apiFetch<ApiResponse<ChatRoom[]>>("/api/chat/rooms")
    return res.data || []
  },

  /** Get all messages for a specific room */
  async getMessages(roomId: number): Promise<ChatMessage[]> {
    const res = await apiFetch<ApiResponse<ChatMessage[]>>(`/api/chat/rooms/${roomId}/messages`)
    return res.data || []
  },

  /** Send message in a chat room */
  async sendMessage(roomId: number, content: string): Promise<ChatMessage> {
    const res = await apiFetch<ApiResponse<ChatMessage>>(`/api/chat/rooms/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
    return res.data!
  },

  /** Mark project completed (Client side button trigger) */
  async markProjectCompleted(roomId: number): Promise<{ project_status: string; message: string }> {
    const res = await apiFetch<ApiResponse<{ project_status: string }>>(
      `/api/chat/rooms/${roomId}/complete`,
      { method: "POST" }
    )
    return {
      project_status: res.data!.project_status,
      message: res.message || "Project marked as Completed!"
    }
  },

  /** Get project-specific discussion messages (moderated & restricted) */
  async getProjectMessages(projectId: number): Promise<ChatMessage[]> {
    const res = await apiFetch<ApiResponse<ChatMessage[]>>(`/api/projects/${projectId}/messages`)
    return res.data || []
  },

  /** Send project message with optional file attachment */
  async sendProjectMessage(projectId: number, message: string, attachment?: File): Promise<ChatMessage> {
    if (attachment) {
      const formData = new FormData()
      formData.append("message", message)
      formData.append("attachment", attachment)
      formData.append("message_type", "FILE")
      
      const res = await apiFetch<ApiResponse<ChatMessage>>(`/api/projects/${projectId}/messages`, {
        method: "POST",
        body: formData,
      })
      return res.data!
    } else {
      const res = await apiFetch<ApiResponse<ChatMessage>>(`/api/projects/${projectId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message, message_type: "TEXT" }),
      })
      return res.data!
    }
  },

  /** Get meetings for a project */
  async getProjectMeetings(projectId: number): Promise<Meeting[]> {
    const res = await apiFetch<ApiResponse<Meeting[]>>(`/api/projects/${projectId}/meetings`)
    return res.data || []
  },

  /** Schedule/create a project meeting */
  async createProjectMeeting(projectId: number): Promise<Meeting> {
    const res = await apiFetch<ApiResponse<Meeting>>(`/api/projects/${projectId}/meetings`, {
      method: "POST",
      body: JSON.stringify({}),
    })
    return res.data!
  },

  /** Start a scheduled meeting */
  async startMeeting(meetingId: number): Promise<Meeting> {
    const res = await apiFetch<ApiResponse<Meeting>>(`/api/meetings/${meetingId}/start`, {
      method: "POST",
    })
    return res.data!
  },

  /** End an active meeting */
  async endMeeting(meetingId: number): Promise<Meeting> {
    const res = await apiFetch<ApiResponse<Meeting>>(`/api/meetings/${meetingId}/end`, {
      method: "POST",
    })
    return res.data!
  },

  /** Get warnings status for user on project */
  async getProjectWarnings(projectId: number): Promise<WarningStatus> {
    const res = await apiFetch<ApiResponse<WarningStatus>>(`/api/projects/${projectId}/warnings`)
    return res.data || { warning_count: 0, restricted: false }
  }
}

export default chatService
