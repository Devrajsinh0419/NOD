"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

interface UserSession {
  id: string
  device_name: string
  browser: string
  os: string
  ip_address: string
  country: string
  city: string | null
  login_time: string
  last_activity: string
  is_current: boolean
  expires_in: number
}

export default function SecurityPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState<{
    show: boolean
    action: "revoke_single" | "revoke_others" | "revoke_all"
    sessionId?: string
    deviceName?: string
  }>({ show: false, action: "revoke_others" })

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<{ success: boolean; sessions: UserSession[] }>(
        "/api/accounts/sessions/"
      )
      if (data.success) {
        setSessions(data.sessions)
      } else {
        setError("Failed to fetch sessions")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load active sessions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleRevocation = async (
    action: "revoke_single" | "revoke_others" | "revoke_all",
    sessionId?: string
  ) => {
    try {
      setActionLoading(action)
      if (sessionId) setRevokingId(sessionId)

      const response = await apiFetch<{
        success: boolean
        message: string
        logged_out?: boolean
      }>("/api/accounts/sessions/", {
        method: "POST",
        body: JSON.stringify({
          action,
          session_id: sessionId,
        }),
      })

      if (response.success) {
        // If current session was revoked or all sessions were revoked
        if (response.logged_out) {
          localStorage.removeItem("nod_token")
          localStorage.removeItem("nod_user")
          router.push("/login")
          return
        }
        // Refetch sessions
        await fetchSessions()
      } else {
        alert(response.message || "Failed to complete action")
      }
    } catch (err: any) {
      alert(err.message || "An error occurred during revocation")
    } finally {
      setActionLoading(null)
      setRevokingId(null)
      setShowConfirmModal({ show: false, action: "revoke_others" })
    }
  }

  const formatRemainingTime = (seconds: number) => {
    if (seconds <= 0) return "Expired"
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) {
      return `${days}d ${hours}h remaining`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }

  const formatLastActivity = (isoString: string) => {
    const now = new Date()
    const activity = new Date(isoString)
    const diffMs = now.getTime() - activity.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins === 1) return "1 minute ago"
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return "1 hour ago"
    if (diffHours < 24) return `${diffHours} hours ago`

    return activity.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Icons based on Device type / OS
  const getDeviceIcon = (deviceName: string) => {
    const lower = deviceName.toLowerCase()
    if (lower.includes("iphone") || lower.includes("phone")) {
      return (
        <svg className="w-6 h-6 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="1.5" />
          <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    }
    if (lower.includes("ipad") || lower.includes("tablet")) {
      return (
        <svg className="w-6 h-6 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="1.5" />
          <path d="M12 17h.01" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    }
    return (
      <svg className="w-6 h-6 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.5" />
        <path d="M8 21h8M12 17v4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  const currentSession = sessions.find((s) => s.is_current)
  const otherSessions = sessions.filter((s) => !s.is_current)

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-[#F5F0E8] mb-2">Security & Login Sessions</h1>
        <p className="text-sm text-[#8B7355]">
          Manage and review your active login sessions. Terminate any sessions you don't recognize to protect your account.
        </p>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[#C9A96E]/20 border-t-[#C9A96E] rounded-full animate-spin" />
          <p className="text-xs text-[#8B7355]">Loading active sessions...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchSessions}
            className="mt-3 text-xs text-[#C9A96E] hover:underline"
          >
            Retry Fetching
          </button>
        </div>
      ) : (
        <>
          {/* Current Session */}
          {currentSession && (
            <div className="rounded-2xl border border-[#C9A96E]/20 bg-[#1A1714] p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#C9A96E]/10 border-b border-l border-[#C9A96E]/20 px-3 py-1 rounded-bl-xl">
                <span className="text-[10px] uppercase tracking-wider text-[#C9A96E] font-medium">
                  Current Session
                </span>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/20 flex items-center justify-center shrink-0">
                  {getDeviceIcon(currentSession.device_name)}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-[#F5F0E8] flex items-center gap-2">
                    {currentSession.device_name}
                  </h3>
                  <p className="text-sm text-[#8B7355]">
                    {currentSession.browser} on {currentSession.os}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8B7355]/70 pt-1">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      {currentSession.city ? `${currentSession.city}, ` : ""}{currentSession.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {currentSession.ip_address}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8B7355]/70 pt-1">
                    <span>Logged in: {new Date(currentSession.login_time).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-[#C9A96E]/80">
                      {formatRemainingTime(currentSession.expires_in)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <button
                    onClick={() =>
                      setShowConfirmModal({
                        show: true,
                        action: "revoke_single",
                        sessionId: currentSession.id,
                        deviceName: currentSession.device_name,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg border border-[#C45C4D]/30 hover:bg-[#C45C4D]/5 text-[#C45C4D] text-xs font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other Active Sessions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-serif text-[#F5F0E8]">Other Active Sessions</h2>
              <div className="flex gap-3">
                {otherSessions.length > 0 && (
                  <button
                    onClick={() => setShowConfirmModal({ show: true, action: "revoke_others" })}
                    disabled={!!actionLoading}
                    className="px-4 py-2 rounded-xl border border-[#C9A96E]/30 hover:bg-[#C9A96E]/5 text-[#C9A96E] text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    Logout other devices
                  </button>
                )}
                <button
                  onClick={() => setShowConfirmModal({ show: true, action: "revoke_all" })}
                  disabled={!!actionLoading}
                  className="px-4 py-2 rounded-xl border border-[#C45C4D]/30 hover:bg-[#C45C4D]/5 text-[#C45C4D] text-xs font-semibold transition-all disabled:opacity-50"
                >
                  Logout all devices
                </button>
              </div>
            </div>

            {otherSessions.length === 0 ? (
              <div className="rounded-2xl border border-[#C9A96E]/8 bg-[#0D0D0D] p-10 text-center">
                <p className="text-sm text-[#8B7355]">No other active sessions detected.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {otherSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-[#C9A96E]/8 bg-[#141210]/60 p-5 hover:border-[#C9A96E]/20 transition-all flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#C9A96E]/3 border border-[#C9A96E]/12 flex items-center justify-center shrink-0">
                      {getDeviceIcon(session.device_name)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-sm font-semibold text-[#F5F0E8]">{session.device_name}</h4>
                      <p className="text-xs text-[#8B7355]">
                        {session.browser} on {session.os}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#8B7355]/70 pt-0.5">
                        <span>{session.city ? `${session.city}, ` : ""}{session.country}</span>
                        <span>•</span>
                        <span>IP: {session.ip_address}</span>
                        <span>•</span>
                        <span>Active: {formatLastActivity(session.last_activity)}</span>
                      </div>
                      <div className="text-[11px] text-[#8B7355]/60">
                        {formatRemainingTime(session.expires_in)}
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <button
                        onClick={() =>
                          setShowConfirmModal({
                            show: true,
                            action: "revoke_single",
                            sessionId: session.id,
                            deviceName: session.device_name,
                          })
                        }
                        disabled={revokingId === session.id}
                        className="px-2.5 py-1 rounded-md border border-[#C45C4D]/20 hover:bg-[#C45C4D]/5 text-[#C45C4D]/80 hover:text-[#C45C4D] text-xs transition-colors disabled:opacity-50"
                      >
                        {revokingId === session.id ? "Revoking..." : "Revoke"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#1A1714] border border-[#C9A96E]/20 rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold font-serif text-[#F5F0E8] mb-2">
                {showConfirmModal.action === "revoke_single"
                  ? `Revoke Session: ${showConfirmModal.deviceName}`
                  : showConfirmModal.action === "revoke_others"
                  ? "Logout Other Devices"
                  : "Logout All Devices"}
              </h3>
              <p className="text-sm text-[#8B7355]">
                {showConfirmModal.action === "revoke_single"
                  ? "Are you sure you want to terminate this login session? You will be signed out from this device."
                  : showConfirmModal.action === "revoke_others"
                  ? "Are you sure you want to log out from all other active devices? Active sessions on other browsers or devices will be immediately revoked."
                  : "Are you sure you want to log out from all devices, including this one? You will need to log back in to access the platform."}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal({ show: false, action: "revoke_others" })}
                disabled={!!actionLoading}
                className="px-4 py-2 text-xs font-semibold text-[#8B7355] hover:text-white rounded-xl border border-[#C9A96E]/10 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleRevocation(showConfirmModal.action, showConfirmModal.sessionId)
                }
                disabled={!!actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C45C4D] hover:bg-[#A84A3B] rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
