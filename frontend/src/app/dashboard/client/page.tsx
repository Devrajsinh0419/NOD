"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import { projectService } from "@/services/project.service"
import type { Project, ClientDashboardData } from "@/types/project.types"

export default function ClientDashboard() {
  const router = useRouter()
  const [data, setData] = useState<ClientDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const user = authService.getStoredUser()
        if (!user) return



        const dashboard = await projectService.getClientDashboard(user.id)
        setData(dashboard)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-[#C9A96E]/50 rounded-full animate-spin" />
          <p className="text-sm text-[#6B5A42] tracking-wide">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-sm text-red-400/70 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-[#8B7355] hover:text-white/60 underline underline-offset-4 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const projects = data?.projects || []
  const stats = data?.stats
  const meetings = data?.upcoming_meetings || []
  const notifications = data?.notifications || []
  const activity = data?.recent_activity || []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {(() => {
            if (projects.length === 0) {
              return (
                <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-8 text-center space-y-4">
                  <h3 className="text-xl font-light text-[#F5F0E8] font-cormorant">
                    No Active Projects
                  </h3>
                  <p className="text-xs text-[#8B7355] max-w-sm mx-auto leading-relaxed">
                    You haven't created any projects yet. Start by creating a project request to connect with professional designers and architects.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard/client/projects')}
                    className="inline-flex py-2 px-5 rounded-full border border-[#C9A96E]/50 text-xs text-[#C9A96E] hover:bg-[#C9A96E]/10 transition-all font-semibold uppercase tracking-wider"
                  >
                    Create Project
                  </button>
                </div>
              );
            }

            const featuredProject = projects[0] as any;
            const title = featuredProject.title;
            const description = featuredProject.description || "Contemporary residential project focused on warm interiors and efficient planning.";
            const imageUrl = featuredProject.image || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                onClick={() => {
                  router.push(`/dashboard/client/projects?id=${projects[0].id}`);
                }}
                className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] overflow-hidden flex flex-col md:flex-row transition-all duration-300 hover:border-[#C9A96E]/18 cursor-pointer"
              >
                <div className="md:w-[45%] h-56 md:h-auto relative overflow-hidden bg-black/20">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-light text-[#F5F0E8] font-cormorant">
                      {title}
                    </h3>
                    <p className="text-xs text-[#8B7355] leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: String(stats?.active_projects ?? 0).padStart(2, "0"), label: "Active Projects" },
              { value: String(stats?.saved_professionals ?? 0).padStart(2, "0"), label: "Saved Professionals" },
              { value: String(stats?.pending_quotes ?? 0).padStart(2, "0"), label: "Pending Quotes" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border bg-[#1A1714] p-6 text-center transition-all duration-300 group border-[#C9A96E]/50 hover:border-[#C9A96E]/15 hover:bg-[#161616]"
              >
                <p className="text-4xl lg:text-5xl font-light text-[#F5F0E8] mb-2 font-cormorant group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B5A42]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
            
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-5">
            <h4 className="text-lg font-light text-[#F5F0E8] mb-4 font-cormorant">
              Upcoming Meetings
            </h4>
            <div className="space-y-4">
              {meetings.map((m, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]/40 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-[#C9A96E]/80 font-sans">{m.title}</p>
                    <p className="text-xs text-[#8B7355] mt-0.5 font-sans">
                      {m.date} • {m.time}
                    </p>
                  </div>
                </div>
              ))}
              {meetings.length === 0 && (
                <p className="text-xs text-[#8B7355]">No upcoming meetings</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-5">
            <h4 className="text-lg font-light text-[#F5F0E8] mb-4 font-cormorant">
              Notifications
            </h4>
            <div className="space-y-4">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#C9A96E]/30 mt-2 shrink-0" />
                  <p className="text-xs text-[#8B7355] leading-relaxed font-sans">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-xs text-[#8B7355]">No new notifications</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#C9A96E]/50 bg-[#1A1714] p-5">
            <h4 className="text-lg font-light text-[#F5F0E8] mb-4 font-cormorant">
              Recent Activity
            </h4>
            <div className="space-y-4">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]/30 mt-1.5 shrink-0" />
                  <p className="text-xs text-[#8B7355] leading-relaxed font-sans">{a.description}</p>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-xs text-[#8B7355]">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}