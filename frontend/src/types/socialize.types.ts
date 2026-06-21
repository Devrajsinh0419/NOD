export interface SocializePost {
  id: number
  user: {
    id: number
    username: string
    full_name: string
    role: string
    profile_photo: string | null
    is_following?: boolean
  }
  title: string
  caption: string
  category: string
  image: string | null
  video: string | null
  likes_count: number
  comments_count: number
  shares_count: number
  saves_count: number
  is_liked: boolean
  is_saved: boolean
  created_at: string
}

export interface SocializeSidebarData {
  top_posts: Array<{ id: number; title: string; likes_count: number }>
  trending_professionals: Array<{ id: number; username: string; full_name: string; profile_photo: string | null; role: string }>
  popular_tags: string[]
  trending_moodboards: Array<{ name: string; post_count: number }>
}

export interface SocializeFeedResponse {
  posts: SocializePost[]
  sidebar: SocializeSidebarData | null
}

export interface SocializeProfileUser {
  id: number
  username: string
  full_name: string
  profile_photo: string | null
  role: string
}

export interface SocializeUserProfile {
  id: number
  username: string
  full_name: string
  profile_photo: string | null
  role: string
  bio: string
  experience_years: number
  followers_count: number
  following_count: number
  followers: SocializeProfileUser[]
  following: SocializeProfileUser[]
  is_following: boolean
  posts: SocializePost[]
}
