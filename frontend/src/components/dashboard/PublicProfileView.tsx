"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { socializeService } from "@/services/socialize.service"
import type { SocializeUserProfile } from "@/types/socialize.types"
import { getMediaUrl } from "@/lib/api"
import { FaHeart, FaBookmark, FaPaperPlane } from "react-icons/fa6"
import { authService } from "@/services/auth.service"

interface Props {
  username: string
  role: "client" | "designer" | "architect" | "contractor"
}

export default function PublicProfileView({ username, role }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<SocializeUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"posts" | "followers" | "following">("posts")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [followingActionLoading, setFollowingActionLoading] = useState(false)

  useEffect(() => {
    setCurrentUser(authService.getStoredUser())
    loadProfile()
  }, [username])

  async function loadProfile() {
    setLoading(true)
    setError("")
    try {
      const data = await socializeService.getUserProfile(username)
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load public profile")
    } finally {
      setLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!profile) return
    setFollowingActionLoading(true)
    try {
      const result = await socializeService.followUser(profile.username)
      setProfile((prev) => {
        if (!prev) return null

        // Update followers list dynamically if toggling
        let updatedFollowers = [...prev.followers]
        if (currentUser) {
          const alreadyFollower = prev.followers.some((f) => f.id === currentUser.id)
          if (alreadyFollower) {
            updatedFollowers = updatedFollowers.filter((f) => f.id !== currentUser.id)
          } else {
            updatedFollowers.push({
              id: currentUser.id,
              username: currentUser.username,
              full_name: `${currentUser.first_name} ${currentUser.last_name || ""}`.trim() || currentUser.username,
              profile_photo: currentUser.profile_photo || null,
              role: currentUser.role
            })
          }
        }

        return {
          ...prev,
          is_following: result.is_following,
          followers_count: result.followers_count,
          followers: updatedFollowers
        }
      })
    } catch (err) {
      console.error("Failed to toggle follow status:", err)
    } finally {
      setFollowingActionLoading(false)
    }
  }

  const handleLike = async (postId: number) => {
    try {
      const result = await socializeService.likePost(postId)
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId
              ? { ...p, likes_count: result.likes_count, is_liked: result.is_liked }
              : p
          )
        }
      })
    } catch (err) {
      console.error("Failed to like post:", err)
    }
  }

  const handleSave = async (postId: number) => {
    try {
      const result = await socializeService.savePost(postId)
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId
              ? { ...p, saves_count: result.saves_count, is_saved: result.is_saved }
              : p
          )
        }
      })
    } catch (err) {
      console.error("Failed to save post:", err)
    }
  }

  const handleShare = async (postId: number) => {
    try {
      const result = await socializeService.sharePost(postId)
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId ? { ...p, shares_count: result.shares_count } : p
          )
        }
      })
      const shareUrl = `${window.location.origin}/public/showcase/${postId}`
      await navigator.clipboard.writeText(shareUrl)
      alert("Showcase post link copied to clipboard!")
    } catch (err) {
      console.error("Failed to share post:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-[#C9A96E]/20 border-t-[#C9A96E]/60 rounded-full animate-spin" />
        <p className="text-xs text-[#8B7355]">Loading public profile...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-[#C45C4D]/10 bg-[#C45C4D]/5 p-6 text-center space-y-4 max-w-xl mx-auto">
        <p className="text-xs text-[#C45C4D]">{error || "User profile not found."}</p>
        <button
          onClick={() => router.push(pathname)}
          className="px-4 py-2 bg-[#C9A96E] text-[#0D0D0D] rounded-xl text-xs font-semibold hover:bg-[#B8944F] transition-colors"
        >
          Back to Feed
        </button>
      </div>
    )
  }

  const isOwnProfile = currentUser?.username === profile.username

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Back to Feed Bar */}
      <div className="flex items-center justify-between border-b border-[#C9A96E]/10 pb-4">
        <button
          onClick={() => router.push(pathname)}
          className="flex items-center gap-2 text-xs text-[#8B7355] hover:text-[#C9A96E] transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back to Feed</span>
        </button>
        <span className="text-[10px] uppercase tracking-wider text-black">Public Profile</span>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-2xl border border-[#C9A96E]/20 bg-linear-to-b from-[#1E1A16] to-[#141210] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start shadow-xl">
        {/* Decorative subtle gradient radial background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#C9A96E]/5 to-transparent rounded-full pointer-events-none -mr-16 -mt-16" />

        {/* Profile Picture */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 border-2 border-[#C9A96E]/30 bg-[#1A1714] shadow-md group">
          {profile.profile_photo ? (
            <img
              src={getMediaUrl(profile.profile_photo)}
              alt={profile.full_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-light text-[#8B7355] bg-[#C9A96E]/5 uppercase">
              {profile.full_name.charAt(0)}
            </div>
          )}
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div className="space-y-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h2 className="text-2xl font-light text-white font-serif" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {profile.full_name}
              </h2>
              <span className="self-center md:self-auto px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border border-[#C9A96E]/30 bg-[#C9A96E]/10 text-[#C9A96E] font-medium w-fit">
                {profile.role}
              </span>
            </div>
            <p className="text-xs text-white font-mono">@{profile.username}</p>
          </div>

          {/* Bio & Details */}
          {profile.bio && (
            <p className="text-xs text-white/70 leading-relaxed max-w-xl whitespace-pre-wrap">{profile.bio}</p>
          )}

          {/* Key Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-[#8B7355]">
            {profile.experience_years > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C9A96E]/10 bg-white/2">
                <span>💼</span>
                <span>{profile.experience_years} Years Experience</span>
              </div>
            )}
          </div>

          {/* Followers / Following Stats */}
          <div className="flex items-center justify-center md:justify-start gap-6 border-t border-[#C9A96E]/6 pt-4 w-full">
            <button
              onClick={() => setActiveTab("followers")}
              className="text-left group"
            >
              <p className="text-lg font-semibold text-white font-mono leading-none group-hover:text-[#C9A96E] transition-colors">{profile.followers_count}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#6B5A42] mt-1 font-medium">Followers</p>
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button
              onClick={() => setActiveTab("following")}
              className="text-left group"
            >
              <p className="text-lg font-semibold text-white font-mono leading-none group-hover:text-[#C9A96E] transition-colors">{profile.following_count}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#6B5A42] mt-1 font-medium">Following</p>
            </button>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-left">
              <p className="text-lg font-semibold text-white font-mono leading-none">{profile.posts.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#6B5A42] mt-1 font-medium">Posts</p>
            </div>
          </div>
        </div>

        {/* Action Button (Follow/Unfollow) */}
        {!isOwnProfile && (
          <div className="shrink-0 md:self-start">
            <button
              onClick={handleFollowToggle}
              disabled={followingActionLoading}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 min-w-28 ${profile.is_following
                ? "border border-[#C9A96E]/40 hover:border-[#C45C4D] hover:bg-[#C45C4D]/5 text-[#C9A96E] hover:text-[#C45C4D]"
                : "bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#B8944F] hover:shadow-[0_0_15px_rgba(201,169,110,0.15)]"
                } disabled:opacity-50`}
            >
              {profile.is_following ? "Following" : "Follow"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#C9A96E]/10">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-6 py-3 text-xs uppercase tracking-wider font-medium transition-colors border-b-2 -mb-0.5 ${activeTab === "posts"
            ? "border-[#C9A96E] text-[#C9A96E]"
            : "border-transparent text-[#6B5A42] hover:text-[#8B7355]"
            }`}
        >
          Posts ({profile.posts.length})
        </button>
        <button
          onClick={() => setActiveTab("followers")}
          className={`px-6 py-3 text-xs uppercase tracking-wider font-medium transition-colors border-b-2 -mb-0.5 ${activeTab === "followers"
            ? "border-[#C9A96E] text-[#C9A96E]"
            : "border-transparent text-[#6B5A42] hover:text-[#8B7355]"
            }`}
        >
          Followers ({profile.followers.length})
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`px-6 py-3 text-xs uppercase tracking-wider font-medium transition-colors border-b-2 -mb-0.5 ${activeTab === "following"
            ? "border-[#C9A96E] text-[#C9A96E]"
            : "border-transparent text-[#6B5A42] hover:text-[#8B7355]"
            }`}
        >
          Following ({profile.following.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-48">
        {/* Posts Tab */}
        {activeTab === "posts" && (
          profile.posts.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] text-[#6B5A42] italic text-xs">
              No showcase posts published by this user.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-[#C9A96E]/10 bg-[#1A1714] overflow-hidden flex flex-col hover:border-[#C9A96E]/20 transition-all group"
                >
                  {/* Post User Header */}
                  <div className="p-4 flex items-center justify-between border-b border-[#C9A96E]/6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C9A96E]/12 bg-[#C9A96E]/5 flex items-center justify-center">
                        {profile.profile_photo ? (
                          <img src={getMediaUrl(profile.profile_photo)} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-light text-[#8B7355]">{profile.full_name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#F5F0E8] leading-none">{profile.full_name}</h4>
                        <p className="text-[10px] text-[#C9A96E]/60 mt-1 uppercase tracking-wider">{post.user?.role || profile.role}</p>
                      </div>
                    </div>

                    {currentUser && !isOwnProfile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollowToggle()
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 ${
                          profile.is_following
                            ? "border border-[#C9A96E]/40 text-[#C9A96E] hover:border-[#C45C4D] hover:text-[#C45C4D] hover:bg-[#C45C4D]/5"
                            : "bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#B8944F]"
                        }`}
                      >
                        {profile.is_following ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-[#0D0D0D]/50 relative border-b border-[#C9A96E]/6">
                      <img
                        src={getMediaUrl(post.image)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                    </div>
                  )}

                  {/* Post Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-light text-[#F5F0E8] leading-tight font-serif" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {post.title}
                      </h3>
                      <p className="text-xs text-[#8B7355] leading-relaxed line-clamp-3 whitespace-pre-wrap">{post.caption}</p>
                    </div>

                    {/* Post Actions Footer */}
                    <div className="flex items-center gap-6 text-[14px] text-[#8B7355] border-t border-white/5 pt-3.5 mt-auto">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${post.is_liked ? "text-red-400/90" : "hover:text-[#C9A96E]"
                          }`}
                      >
                        <FaHeart />
                        <span className="font-mono text-xs">{post.likes_count}</span>
                      </button>

                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-1.5 hover:text-[#C9A96E] transition-colors"
                      >
                        <FaPaperPlane />
                        <span className="font-mono text-xs">{post.shares_count}</span>
                      </button>

                      <button
                        onClick={() => handleSave(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${post.is_saved ? "text-[#C9A96E]" : "hover:text-[#C9A96E]"
                          }`}
                      >
                        <FaBookmark />
                        <span className="font-mono text-xs">{post.saves_count}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Followers Tab */}
        {activeTab === "followers" && (
          profile.followers.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] text-[#6B5A42] italic text-xs">
              No followers yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.followers.map((follower) => (
                <div
                  key={follower.id}
                  onClick={() => {
                    setActiveTab("posts")
                    router.push(`${pathname}?user=${follower.username}`)
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[#C9A96E]/10 bg-[#1A1714] hover:bg-[#C9A96E]/5 hover:border-[#C9A96E]/20 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C9A96E]/10 bg-[#C9A96E]/5 flex items-center justify-center">
                    {follower.profile_photo ? (
                      <img src={getMediaUrl(follower.profile_photo)} alt={follower.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-light text-[#8B7355]">{follower.full_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-[#F5F0E8] group-hover:text-[#C9A96E] transition-colors truncate">{follower.full_name}</h4>
                    <p className="text-[10px] text-[#8B7355] truncate">@{follower.username}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider border border-[#C9A96E]/10 bg-[#C9A96E]/3 text-[#C9A96E]/60 px-2 py-0.5 rounded-full shrink-0">
                    {follower.role}
                  </span>
                </div>
              ))}
            </div>
          )
        )}

        {/* Following Tab */}
        {activeTab === "following" && (
          profile.following.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-[#C9A96E]/8 bg-[#1A1714] text-[#6B5A42] italic text-xs">
              Not following anyone yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.following.map((followedUser) => (
                <div
                  key={followedUser.id}
                  onClick={() => {
                    setActiveTab("posts")
                    router.push(`${pathname}?user=${followedUser.username}`)
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[#C9A96E]/10 bg-[#1A1714] hover:bg-[#C9A96E]/5 hover:border-[#C9A96E]/20 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C9A96E]/10 bg-[#C9A96E]/5 flex items-center justify-center">
                    {followedUser.profile_photo ? (
                      <img src={getMediaUrl(followedUser.profile_photo)} alt={followedUser.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-light text-[#8B7355]">{followedUser.full_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-[#F5F0E8] group-hover:text-[#C9A96E] transition-colors truncate">{followedUser.full_name}</h4>
                    <p className="text-[10px] text-[#8B7355] truncate">@{followedUser.username}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider border border-[#C9A96E]/10 bg-[#C9A96E]/3 text-[#C9A96E]/60 px-2 py-0.5 rounded-full shrink-0">
                    {followedUser.role}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
