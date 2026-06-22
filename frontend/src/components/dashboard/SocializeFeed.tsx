"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { authService } from "@/services/auth.service"
import { socializeService } from "@/services/socialize.service"
import type { SocializePost } from "@/types/socialize.types"
import {
  FaBookmark,
  FaHeart,
  FaShareNodes,
  FaPaperPlane
} from "react-icons/fa6"
import { getMediaUrl } from "@/lib/api"
import PublicProfileView from "./PublicProfileView"

interface Props {
  role: "client" | "designer" | "architect" | "contractor"
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "architecture", label: "Architecture" },
  { id: "interior", label: "Interior" },
  { id: "construction", label: "Construction" },
  { id: "3d visuals", label: "3D Visuals" },
  { id: "concept design", label: "Concept Design" },
]

export default function SocializeFeed({ role }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const usernameParam = searchParams.get("user")

  const [posts, setPosts] = useState<SocializePost[]>([])
  const [sidebar, setSidebar] = useState<import("@/types/socialize.types").SocializeSidebarData | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Sidebar widget tabs
  const [activeWidgetTab, setActiveWidgetTab] = useState<"posts" | "designers" | "tags">("posts")

  // Post modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postForm, setPostForm] = useState({
    title: "",
    category: "architecture",
    caption: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCurrentUser(authService.getStoredUser())
  }, [])

  useEffect(() => {
    loadPosts(activeCategory)
  }, [activeCategory, searchParams])

  async function loadPosts(cat: string) {
    setLoading(true)
    setError("")
    try {
      const res = await socializeService.getPosts(cat)
      const postParam = searchParams.get("post")
      let postsList = res.posts || []
      if (postParam) {
        const targetId = parseInt(postParam)
        const targetIdx = postsList.findIndex((p) => p.id === targetId)
        if (targetIdx !== -1) {
          const targetPost = postsList[targetIdx]
          postsList = [targetPost, ...postsList.filter((p) => p.id !== targetId)]
        }
      }
      setPosts(postsList)
      if (res.sidebar) {
        setSidebar(res.sidebar)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load showcase posts")
    } finally {
      setLoading(false)
    }
  }

  // Interaction handlers
  const handleLike = async (postId: number) => {
    try {
      const result = await socializeService.likePost(postId)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes_count: result.likes_count, is_liked: result.is_liked }
            : p
        )
      )
    } catch (err) {
      console.error("Failed to like post:", err)
    }
  }

  const handleSave = async (postId: number) => {
    try {
      const result = await socializeService.savePost(postId)
      setPosts((prev) => {
        const updated = prev.map((p) =>
          p.id === postId
            ? { ...p, saves_count: result.saves_count, is_saved: result.is_saved }
            : p
        )
        if (activeCategory === "saved" && !result.is_saved) {
          return updated.filter((p) => p.id !== postId)
        }
        return updated
      })
    } catch (err) {
      console.error("Failed to save post:", err)
    }
  }

  const handleShare = async (postId: number) => {
    try {
      const result = await socializeService.sharePost(postId)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, shares_count: result.shares_count } : p
        )
      )
      // Copy mockup share URL to clipboard
      const shareUrl = `${window.location.origin}/public/showcase/${postId}`
      await navigator.clipboard.writeText(shareUrl)
      alert("Showcase post link copied to clipboard!")
    } catch (err) {
      console.error("Failed to share post:", err)
    }
  }

  // Post Submission handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postForm.title || !postForm.caption || !selectedImage) {
      alert("Please provide title, caption, and rendering image.")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("title", postForm.title)
      formData.append("category", postForm.category)
      formData.append("caption", postForm.caption)
      formData.append("image", selectedImage)

      await socializeService.createPost(formData)

      // Reset form
      setPostForm({ title: "", category: "architecture", caption: "" })
      setSelectedImage(null)
      setImagePreview(null)
      setShowCreateModal(false)

      // Reload posts
      loadPosts(activeCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload showcase post")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFollowToggle = async (username: string) => {
    try {
      const result = await socializeService.followUser(username)
      setPosts((prev) =>
        prev.map((p) =>
          p.user.username === username
            ? { ...p, user: { ...p.user, is_following: result.is_following } }
            : p
        )
      )
    } catch (err) {
      console.error("Failed to toggle follow status:", err)
    }
  }

  if (usernameParam) {
    return <PublicProfileView username={usernameParam} role={role} />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="space-y-1">
        <h2
          className="text-3xl font-light text-[#F5F0E8] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Socialize
        </h2>
        <p className="text-xs text-[#8B7355] max-w-xl">
          Discover architectural showcases, interior concepts, and creative project inspirations.
        </p>
      </div>

      {/* Category Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-light tracking-wide transition-all border ${activeCategory === cat.id
              ? "bg-[#C9A96E] text-[#0D0D0D] border-[#C9A96E]"
              : "bg-[#C9A96E]/5 text-[#8B7355] border-[#C9A96E]/10 hover:bg-[#C9A96E]/12 hover:text-[#E8D5B5]"
              }`}
          >
            {cat.label}
          </button>
        ))}
        <div className="h-4 w-px bg-white/10 mx-1" />
        <button
          onClick={() => setActiveCategory("saved")}
          className={`px-4 py-2 rounded-full text-xs font-light tracking-wide transition-all border flex items-center gap-1.5 ${activeCategory === "saved"
            ? "bg-[#C9A96E] text-[#0D0D0D] border-[#C9A96E]"
            : "bg-[#C9A96E]/30 text-black border-[#C9A96E]/20 hover:bg-[#C9A96E] hover:text-white"
            }`}
        >
          <span><FaBookmark /></span>
          Saved Posts
        </button>
      </div>

      {error && (
        <div className="text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Main Grid: Feed & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Feed */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-[#C9A96E]/12 border-t-[#C9A96E]/50 rounded-full animate-spin" />
              <p className="text-xs text-[#6B5A42]">Loading social showcase posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-[#C9A96E]/6 bg-[#1A1714] py-16 text-center">
              <p className="text-xs text-[#6B5A42] italic">
                {activeCategory === "saved"
                  ? "You haven't saved any showcase posts yet."
                  : "No showcase posts available in this category."}
              </p>
              {role !== "client" && activeCategory !== "saved" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#C9A96E] text-[#0D0D0D] text-xs font-semibold hover:bg-[#B8944F]"
                >
                  Share the First Concept
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => {
              const isSharedPost = post.id === parseInt(searchParams.get("post") || "")
              return (
                <div
                  key={post.id}
                  className={`rounded-2xl border bg-[#1A1714] overflow-hidden flex flex-col transition-all duration-500 ${
                    isSharedPost
                      ? "border-[#C9A96E] shadow-[0_0_25px_rgba(201,169,110,0.25)] ring-1 ring-[#C9A96E]/50 scale-[1.01]"
                      : "border-[#C9A96E]/80"
                  }`}
                >
                  {/* Post User Header */}
                  <div className="p-4 flex items-center justify-between border-b border-[#C9A96E]/6">
                    <div
                      onClick={() => router.push(`${pathname}?user=${post.user.username}`)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C9A96E]/12 bg-[#C9A96E]/5 flex items-center justify-center group-hover:border-[#C9A96E]/40 transition-colors">
                        {post.user.profile_photo ? (
                          <img src={getMediaUrl(post.user.profile_photo)} alt={post.user.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-light text-[#8B7355]">{post.user.full_name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#F5F0E8] leading-none group-hover:text-[#C9A96E] transition-colors">{post.user.full_name}</h4>
                        <p className="text-[10px] text-[#8B7355] font-mono mt-0.5">@{post.user.username}</p>
                        <p className="text-[10px] text-[#C9A96E]/60 mt-1 uppercase tracking-wider">{post.user.role}</p>
                      </div>
                    </div>

                    {currentUser && currentUser.username !== post.user.username && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFollowToggle(post.user.username)
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 ${
                          post.user.is_following
                            ? "border border-[#C9A96E]/40 text-[#C9A96E] hover:border-[#C45C4D] hover:text-[#C45C4D] hover:bg-[#C45C4D]/5"
                            : "bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#B8944F]"
                        }`}
                      >
                        {post.user.is_following ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>

                  {/* Post Image Showcase */}
                  {post.image && (
                    <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#C9A96E]/6 bg-[#0D0D0D]/50 relative">
                      <img src={getMediaUrl(post.image)} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Post Body Info */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-light text-[#F5F0E8] leading-tight font-serif" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#8B7355] leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                  </div>

                  {/* Action Metrics Footer */}
                  <div className="px-5 pb-5 pt-1 border-t border-[#C9A96E]/4 flex items-center gap-6 text-[16px] text-[#8B7355]">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${post.is_liked ? "text-red-400/90" : "hover:text-[#C9A96E]"
                        }`}
                    >
                      <span><FaHeart /></span>
                      <span className="font-mono">
                        {post.likes_count >= 1000 ? `${(post.likes_count / 1000).toFixed(1)}k` : post.likes_count}
                      </span>
                    </button>

                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 hover:text-[#C9A96E] transition-colors"
                      title="Share Post"
                    >
                      <span><FaPaperPlane /></span>
                    </button>

                    <button
                      onClick={() => handleSave(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${post.is_saved ? "text-[#C9A96E]" : "hover:text-[#C9A96E]"
                        }`}
                    >
                      <span><FaBookmark /></span>
                      <span className="font-mono">
                        {post.saves_count >= 1000 ? `${(post.saves_count / 1000).toFixed(1)}k` : post.saves_count}
                      </span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right Side: Sidebar Widgets */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Widget 1: Tabs */}
          <div className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] p-5 space-y-4">
            <div className="flex border-b border-[#C9A96E]/6 text-[10px] uppercase tracking-wider font-semibold">
              <button
                onClick={() => setActiveWidgetTab("posts")}
                className={`pb-2 flex-1 text-center transition-colors ${activeWidgetTab === "posts" ? "text-[#C9A96E] border-b border-[#C9A96E]" : "text-[#6B5A42] hover:text-[#8B7355]"
                  }`}
              >
                Top Posts
              </button>
              <button
                onClick={() => setActiveWidgetTab("designers")}
                className={`pb-2 flex-1 text-center transition-colors ${activeWidgetTab === "designers" ? "text-[#C9A96E] border-b border-[#C9A96E]" : "text-[#6B5A42] hover:text-[#8B7355]"
                  }`}
              >
                Trending
              </button>
              <button
                onClick={() => setActiveWidgetTab("tags")}
                className={`pb-2 flex-1 text-center transition-colors ${activeWidgetTab === "tags" ? "text-[#C9A96E] border-b border-[#C9A96E]" : "text-[#6B5A42] hover:text-[#8B7355]"
                  }`}
              >
                Popular
              </button>
            </div>

            <div className="min-h-[120px] text-xs">
              {activeWidgetTab === "posts" && (
                <ul className="space-y-2.5">
                  {!sidebar?.top_posts || sidebar.top_posts.length === 0 ? (
                    <li className="text-[10px] text-[#6B5A42] italic">No posts found</li>
                  ) : (
                    sidebar.top_posts.map((tp) => (
                      <li key={tp.id} className="flex justify-between items-center text-[#8B7355] hover:text-[#C9A96E] cursor-pointer transition-colors">
                        <span>{tp.title}</span>
                        <span className="text-[10px] text-[#6B5A42] font-mono">{tp.likes_count} likes</span>
                      </li>
                    ))
                  )}
                </ul>
              )}

              {activeWidgetTab === "designers" && (
                <ul className="space-y-3">
                  {!sidebar?.trending_professionals || sidebar.trending_professionals.length === 0 ? (
                    <li className="text-[10px] text-[#6B5A42] italic">No professional found</li>
                  ) : (
                    sidebar.trending_professionals.map((prof) => (
                      <li
                        key={prof.id}
                        onClick={() => router.push(`${pathname}?user=${prof.username}`)}
                        className="flex items-center justify-between cursor-pointer group hover:bg-[#C9A96E]/5 p-1 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-[#C9A96E]/10 flex items-center justify-center text-[10px] group-hover:border-[#C9A96E]/30 border border-transparent transition-colors">
                            {prof.profile_photo ? (
                              <img src={getMediaUrl(prof.profile_photo)} alt={prof.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{prof.full_name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#B8A88A] text-[11px] group-hover:text-[#C9A96E] transition-colors font-medium">{prof.full_name}</span>
                            <span className="text-[#8B7355] text-[9px] font-mono leading-none">@{prof.username}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8AA86E] uppercase shrink-0">{prof.role}</span>
                      </li>
                    ))
                  )}
                </ul>
              )}

              {activeWidgetTab === "tags" && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sidebar?.popular_tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1.5 rounded-lg border border-[#C9A96E]/8 bg-[#C9A96E]/3 text-[10px] text-[#8B7355] cursor-pointer hover:text-[#C9A96E] hover:bg-[#C9A96E]/8 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Professional Only Action Button */}
          {role !== "client" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-[#C9A96E] to-[#B8944F] hover:shadow-[0_0_20px_rgba(201,169,110,0.15)] text-[#0D0D0D] text-xs font-semibold uppercase tracking-widest transition-all shadow-lg"
            >
              Post Project
            </button>
          )}

          {/* Widget 2: Trending Moodboards */}
          <div className="rounded-2xl border border-[#C9A96E]/80 bg-[#1A1714] p-6 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9A96E]">Trending Moodboards</h4>
            <div className="space-y-3">
              {!sidebar?.trending_moodboards || sidebar.trending_moodboards.length === 0 ? (
                <p className="text-[10px] text-[#6B5A42] italic">No moodboards found</p>
              ) : (
                sidebar.trending_moodboards.map((mb) => (
                  <div key={mb.name} className="flex items-center justify-between border border-[#C9A96E]/50 rounded-xl p-2.5 hover:bg-[#C9A96E]/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#C9A96E]/5 flex items-center justify-center text-xs">
                        🎨
                      </div>
                      <span className="text-[11px] font-medium text-[#B8A88A]">{mb.name}</span>
                    </div>
                    <span className="text-[9px] text-[#6B5A42] font-mono">{mb.post_count} posts</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload/Post Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-light text-[#F5F0E8] font-serif" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Post Project Rendering
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full border border-[#C9A96E]/12 flex items-center justify-center hover:bg-[#C9A96E]/5 text-[#8B7355] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Showcase Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minimal Contemporary Villa"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Category</label>
                <select
                  value={postForm.category}
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#1A1714] px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none"
                >
                  <option value="architecture">Architecture</option>
                  <option value="interior">Interior</option>
                  <option value="construction">Construction</option>
                  <option value="3d visuals">3D Visuals</option>
                  <option value="concept design">Concept Design</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Caption & Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your design choices, spatial flow, lighting concept..."
                  value={postForm.caption}
                  onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })}
                  className="w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-2.5 text-xs text-[#F5F0E8] focus:border-[#C9A96E]/25 outline-none resize-none"
                />
              </div>

              {/* Rendering Upload */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#6B5A42] mb-1.5">Concept Rendering / Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[16/9] border border-dashed border-[#C9A96E]/40 rounded-2xl hover:border-[#C9A96E]/20 transition-colors cursor-pointer flex flex-col items-center justify-center bg-[#C9A96E]/3 relative overflow-hidden group"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-xl">⏏</p>
                      <p className="text-[10px] text-[#6B5A42]/60 font-medium uppercase tracking-wider">Upload Design Concept</p>
                      <p className="text-[9px] text-[#6B5A42]">Supports JPG, PNG rendering files</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#C9A96E]/6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#C9A96E]/12 text-[#8B7355] text-xs hover:text-white/70 hover:bg-[#B8944F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#C9A96E]/90 text-[#0D0D0D] text-xs font-semibold hover:bg-[#B8944F] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading..." : "Publish to Showcase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
