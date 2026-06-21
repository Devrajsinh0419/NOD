export interface ChatUser {
  id: number
  username: string
  full_name: string
  role: string
  profile_photo: string | null
}

export interface ChatProject {
  id: number
  title: string
  status: string
  payment_status: string
  completion_status: {
    client_confirmed: boolean
    professional_confirmed: boolean
    both_confirmed: boolean
  }
}

export interface ChatRoom {
  id: number
  name: string
  room_type: string
  project: ChatProject | null
  other_user: ChatUser | null
  last_message: {
    content: string
    created_at: string
  } | null
  updated_at: string
}

export interface ChatMessage {
  id: number
  content: string
  is_system_message: boolean
  message_type?: 'TEXT' | 'FILE' | 'SYSTEM'
  is_flagged?: boolean
  attachment?: string | null
  created_at: string
  sender: {
    id: number
    full_name: string
    role: string
    profile_photo: string | null
  }
}
