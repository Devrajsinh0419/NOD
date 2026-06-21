"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { 
  ShieldAlert, 
  MessageSquare, 
  AlertTriangle, 
  UserX, 
  UserCheck, 
  RefreshCw, 
  Search
} from "lucide-react"

interface BlockedMessage {
  id: number
  user_id: number
  username: string
  project_id: number
  project_title: string
  message: string
  reason: string
  created_at: string
}

interface WarningLog {
  user_id: number
  username: string
  project_id: number | null
  project_title: string | null
  reason: string
  warning_count: number
  created_at: string
}

export default function AdminModerationPage() {
  const [blockedMessages, setBlockedMessages] = useState<BlockedMessage[]>([])
  const [warnings, setWarnings] = useState<WarningLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"blocked" | "warnings">("blocked")
  const [actioningUserId, setActioningUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const [blockedRes, warningsRes] = await Promise.all([
        apiFetch<{ success: boolean; data: BlockedMessage[] }>("/api/admin/moderation/blocked"),
        apiFetch<{ success: boolean; data: WarningLog[] }>("/api/admin/moderation/warnings")
      ])
      
      if (blockedRes.success) {
        setBlockedMessages(blockedRes.data || [])
      }
      if (warningsRes.success) {
        setWarnings(warningsRes.data || [])
      }
    } catch (err) {
      console.error("Failed to fetch admin logs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (
    userId: number, 
    projectId: number | null, 
    action: "restrict" | "lift"
  ) => {
    setActioningUserId(userId)
    try {
      const res = await apiFetch<{ success: boolean; message: string }>("/api/admin/moderation/restrict", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          project_id: projectId,
          action
        })
      })
      alert(res.message || `Action ${action} executed successfully.`)
      await fetchLogs()
    } catch (err) {
      alert("Failed to execute action: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setActioningUserId(null)
    }
  }

  // Filter lists based on search
  const filteredBlocked = blockedMessages.filter((msg) => {
    const query = searchQuery.toLowerCase()
    return (
      msg.username.toLowerCase().includes(query) ||
      msg.project_title.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query) ||
      msg.reason.toLowerCase().includes(query)
    )
  })

  const filteredWarnings = warnings.filter((warn) => {
    const query = searchQuery.toLowerCase()
    return (
      warn.username.toLowerCase().includes(query) ||
      (warn.project_title && warn.project_title.toLowerCase().includes(query)) ||
      warn.reason.toLowerCase().includes(query)
    )
  })

  // Basic stats
  const totalBlocked = blockedMessages.length
  const totalWarnings = warnings.length
  const restrictedUsers = warnings.filter((w) => w.warning_count >= 3).length

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C9A96E]/12 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#C9A96E]">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">NOD Operations</span>
          </div>
          <h2 className="text-2xl font-light text-[#F5F0E8] font-serif tracking-wide mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Admin Moderation Dashboard
          </h2>
          <p className="text-[11px] text-[#8B7355] mt-1">
            Overview of communication alerts, blocked phone numbers/emails sharing, and manual override actions.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2 border border-[#C9A96E]/20 hover:border-[#C9A96E]/40 rounded-xl text-xs font-semibold text-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-55"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Reload logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-[#C9A96E]/20 bg-[#111111] space-y-2">
          <div className="flex justify-between items-center text-[#8B7355]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Blocked Messages</span>
            <MessageSquare className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <p className="text-3xl font-light text-[#F5F0E8] font-mono leading-none">{totalBlocked}</p>
          <p className="text-[9px] text-[#6B5A42]">Messages containing restricted contact patterns.</p>
        </div>

        <div className="p-5 rounded-2xl border border-[#C9A96E]/20 bg-[#111111] space-y-2">
          <div className="flex justify-between items-center text-[#8B7355]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Warning Strikes Issued</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-light text-[#F5F0E8] font-mono leading-none">{totalWarnings}</p>
          <p className="text-[9px] text-[#6B5A42]">Active warning counts across project discussion channels.</p>
        </div>

        <div className="p-5 rounded-2xl border border-red-500/20 bg-[#111111] space-y-2">
          <div className="flex justify-between items-center text-red-500/80">
            <span className="text-[10px] font-bold uppercase tracking-wider">Restricted Users</span>
            <UserX className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl font-light text-red-500 font-mono leading-none">{restrictedUsers}</p>
          <p className="text-[9px] text-[#6B5A42]">Users with 3 strikes locked out from project chat/meetings.</p>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] p-4 rounded-2xl border border-[#C9A96E]/12">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "blocked"
                ? "bg-[#C9A96E] text-[#0D0D0D] font-bold"
                : "text-[#8B7355] hover:text-[#C9A96E]/80 hover:bg-white/2"
            }`}
          >
            Blocked Messages ({filteredBlocked.length})
          </button>
          <button
            onClick={() => setActiveTab("warnings")}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "warnings"
                ? "bg-[#C9A96E] text-[#0D0D0D] font-bold"
                : "text-[#8B7355] hover:text-[#C9A96E]/80 hover:bg-white/2"
            }`}
          >
            Warning logs ({filteredWarnings.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#C9A96E]/5 border border-[#C9A96E]/6 pl-9 pr-4 py-2 rounded-xl text-xs text-black placeholder-black/80 focus:border-[#C9A96E]/20 outline-none"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="border border-[#C9A96E]/12 rounded-2xl overflow-hidden bg-[#111111]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <RefreshCw className="w-6 h-6 text-[#C9A96E] animate-spin" />
            <span className="text-[10px] text-[#6B5A42] tracking-wider uppercase font-semibold">Loading logs from server...</span>
          </div>
        ) : activeTab === "blocked" ? (
          filteredBlocked.length === 0 ? (
            <p className="text-xs text-[#8B7355] italic text-center py-16">No blocked messages found matching criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#C9A96E]/6 text-[#8B7355] uppercase tracking-wider font-semibold text-[9px] bg-white/2">
                    <th className="p-4">Sender</th>
                    <th className="p-4">Project</th>
                    <th className="p-4">Content</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9A96E]/6">
                  {filteredBlocked.map((msg) => (
                    <tr key={msg.id} className="hover:bg-white/2 transition-colors">
                      <td className="p-4 font-semibold text-[#F5F0E8]">
                        {msg.username}
                        <span className="block text-[9px] text-[#6B5A42] font-mono mt-0.5">UID: {msg.user_id}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#F5F0E8] line-clamp-1">{msg.project_title}</span>
                        <span className="block text-[9px] text-[#6B5A42] font-mono mt-0.5">PID: {msg.project_id}</span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-[#8B7355] bg-red-950/10 border border-red-500/10 rounded-lg p-2 font-mono text-[10px] leading-relaxed break-all">
                          {msg.message}
                        </p>
                      </td>
                      <td className="p-4 text-red-400 font-medium font-serif italic">{msg.reason}</td>
                      <td className="p-4 text-[#6B5A42] font-mono text-[10px]">
                        {new Date(msg.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleAction(msg.user_id, msg.project_id, "restrict")}
                            disabled={actioningUserId !== null}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/20 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <UserX className="w-3 h-3" />
                            Restrict Chat
                          </button>
                          <button
                            onClick={() => handleAction(msg.user_id, null, "restrict")}
                            disabled={actioningUserId !== null}
                            className="px-2.5 py-1.5 rounded-lg bg-red-700/20 hover:bg-red-600 text-red-400 hover:text-black border border-red-600/30 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            Ban Account
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredWarnings.length === 0 ? (
            <p className="text-xs text-[#8B7355] italic text-center py-16">No active warning logs found matching criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#C9A96E]/6 text-[#8B7355] uppercase tracking-wider font-semibold text-[9px] bg-white/2">
                    <th className="p-4">User</th>
                    <th className="p-4">Project</th>
                    <th className="p-4">Warning Count</th>
                    <th className="p-4">Reason Details</th>
                    <th className="p-4">Updated At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9A96E]/6">
                  {filteredWarnings.map((warn, index) => {
                    const isMaxed = warn.warning_count >= 3
                    return (
                      <tr key={index} className="hover:bg-white/2 transition-colors">
                        <td className="p-4 font-semibold text-[#F5F0E8]">
                          {warn.username}
                          <span className="block text-[9px] text-[#6B5A42] font-mono mt-0.5">UID: {warn.user_id}</span>
                        </td>
                        <td className="p-4">
                          {warn.project_title ? (
                            <>
                              <span className="text-[#F5F0E8] line-clamp-1">{warn.project_title}</span>
                              <span className="block text-[9px] text-[#6B5A42] font-mono mt-0.5">PID: {warn.project_id}</span>
                            </>
                          ) : (
                            <span className="text-[#6B5A42] italic">Global / Account</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isMaxed 
                              ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}>
                            {warn.warning_count} / 3 Strikes
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-[#8B7355] line-clamp-2" title={warn.reason}>{warn.reason}</p>
                        </td>
                        <td className="p-4 text-[#6B5A42] font-mono text-[10px]">
                          {new Date(warn.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="inline-flex gap-2">
                            {warn.project_id && (
                              <button
                                onClick={() => handleAction(warn.user_id, warn.project_id, "lift")}
                                disabled={actioningUserId !== null}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <UserCheck className="w-3 h-3" />
                                Lift Strike
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(warn.user_id, null, "lift")}
                              disabled={actioningUserId !== null}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-black border border-blue-500/20 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <UserCheck className="w-3 h-3" />
                              Unban/Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

    </div>
  )
}
