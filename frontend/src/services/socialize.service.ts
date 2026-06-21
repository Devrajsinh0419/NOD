import { apiFetch } from "@/lib/api"
import type { ApiResponse } from "@/types/auth.types"
import type { SocializePost } from "@/types/socialize.types"

export const socializeService = {
  /** Get list of socialize posts, optionally filtered by category */
  async getPosts(category?: string): Promise<import("@/types/socialize.types").SocializeFeedResponse> {
    const query = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : ""
    interface RawRes extends ApiResponse<SocializePost[]> {
      sidebar?: import("@/types/socialize.types").SocializeSidebarData
    }
    const res = await apiFetch<RawRes>(`/api/socialize/posts${query}`)
    return {
      posts: res.data || [],
      sidebar: res.sidebar || null
    }
  },

  /** Create a new show case post */
  async createPost(formData: FormData): Promise<void> {
    await apiFetch("/api/socialize/posts", {
      method: "POST",
      body: formData,
    })
  },

  /** Toggle like status on a post */
  async likePost(postId: number): Promise<{ likes_count: number; is_liked: boolean }> {
    const res = await apiFetch<ApiResponse<{ likes_count: number; is_liked: boolean }>>(
      `/api/socialize/posts/${postId}/like`,
      { method: "POST" }
    )
    return res.data!
  },

  /** Toggle save status on a post */
  async savePost(postId: number): Promise<{ saves_count: number; is_saved: boolean }> {
    const res = await apiFetch<ApiResponse<{ saves_count: number; is_saved: boolean }>>(
      `/api/socialize/posts/${postId}/save`,
      { method: "POST" }
    )
    return res.data!
  },

  /** Increment share counter on a post */
  async sharePost(postId: number): Promise<{ shares_count: number }> {
    const res = await apiFetch<ApiResponse<{ shares_count: number }>>(
      `/api/socialize/posts/${postId}/share`,
      { method: "POST" }
    )
    return res.data!
  },

  /** Get public profile for a user by username */
  async getUserProfile(username: string): Promise<import("@/types/socialize.types").SocializeUserProfile> {
    const res = await apiFetch<ApiResponse<import("@/types/socialize.types").SocializeUserProfile>>(
      `/api/socialize/users/${encodeURIComponent(username)}`
    )
    return res.data!
  },

  /** Toggle follow status on a user by username */
  async followUser(username: string): Promise<{ is_following: boolean; followers_count: number }> {
    const res = await apiFetch<ApiResponse<{ is_following: boolean; followers_count: number }>>(
      `/api/socialize/users/${encodeURIComponent(username)}/follow`,
      { method: "POST" }
    )
    return res.data!
  },
}
export default socializeService
