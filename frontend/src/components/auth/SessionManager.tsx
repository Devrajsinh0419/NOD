"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import { apiFetch } from "@/lib/api"

// Thresholds in milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const WARNING_TIMEOUT = 28 * 60 * 1000 // 28 minutes (modal shows at 28 mins)
const COUNTDOWN_SECONDS = 120 // 2 minutes countdown

export default function SessionManager() {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS)
  const lastActivity = useRef<number>(Date.now())
  const warningTimer = useRef<any>(null)
  const countdownTimer = useRef<any>(null)

  // Reset inactivity timer
  const resetTimer = () => {
    lastActivity.current = Date.now()
    if (showWarning) {
      // If warning is shown, don't auto-reset it on simple mousemove,
      // the user must explicitly click "Extend Session" to close the warning.
      return
    }
  }

  // Handle Extend Session
  const extendSession = async () => {
    try {
      // Call refresh token API to rotate cookies
      await apiFetch("/api/auth/refresh/", { method: "POST" })
      setShowWarning(false)
      setTimeLeft(COUNTDOWN_SECONDS)
      lastActivity.current = Date.now()
    } catch (err) {
      console.error("Failed to extend session:", err)
      handleLogout()
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    setShowWarning(false)
    setTimeLeft(COUNTDOWN_SECONDS)
    
    // Clear all auth state
    try {
      await authService.logout()
    } catch (err) {
      console.error("Error during logout service call:", err)
    }

    // Preserve intended redirect path
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search
      // If we're already on login/signup, don't loop redirect path
      if (!currentPath.includes("/login") && !currentPath.includes("/signup") && currentPath !== "/") {
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      } else {
        router.push("/login")
      }
    }
  }

  // Monitor user activity and session expiration events
  useEffect(() => {
    if (typeof window === "undefined") return

    // Activity event listeners
    const events = ["mousemove", "click", "scroll", "keydown", "touchstart"]
    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    // Listen for silent token refresh failures (from apiFetch)
    const handleSessionExpiredEvent = () => {
      handleLogout()
    }
    window.addEventListener("auth-session-expired", handleSessionExpiredEvent)

    // Check user inactivity periodically (every 5 seconds)
    const checkInterval = setInterval(() => {
      if (!authService.isAuthenticated()) {
        // If not authenticated, do nothing
        return
      }

      const timeElapsed = Date.now() - lastActivity.current
      if (timeElapsed >= WARNING_TIMEOUT && !showWarning) {
        setShowWarning(true)
        setTimeLeft(COUNTDOWN_SECONDS)
      }
    }, 5000)

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
      window.removeEventListener("auth-session-expired", handleSessionExpiredEvent)
      clearInterval(checkInterval)
      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (countdownTimer.current) clearInterval(countdownTimer.current)
    }
  }, [showWarning])

  // Countdown timer effect
  useEffect(() => {
    if (!showWarning) return

    countdownTimer.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current!)
          handleLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current)
    }
  }, [showWarning])

  if (!showWarning) return null

  // Format time remaining MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Progress percentage
  const progressPercentage = (timeLeft / COUNTDOWN_SECONDS) * 100

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      <div className="w-full max-w-md bg-[#1A1714] border border-[#C9A96E]/20 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden transform scale-100 transition-all duration-300">
        
        {/* Decorative Gold Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8B7355] via-[#C9A96E] to-[#8B7355]" />

        {/* Warning Icon */}
        <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C9A96E]/25">
          <svg className="w-8 h-8 text-[#C9A96E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Typography */}
        <h2 className="text-2xl font-serif font-bold text-[#F5F0E8] mb-2 tracking-wide">
          Session Expiring Soon
        </h2>
        <p className="text-sm text-[#8B7355] mb-6 px-4">
          You have been inactive for a while. For security reasons, your session will automatically end in:
        </p>

        {/* Countdown display */}
        <div className="text-5xl font-mono font-semibold text-[#C9A96E] mb-6 tracking-wider animate-pulse">
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#C9A96E]/10 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-gradient-to-r from-[#C9A96E] to-[#8B7355] transition-all duration-1000 ease-linear rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Button Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={extendSession}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl border border-[#C9A96E]/40 bg-[#C9A96E]/10 hover:bg-[#C9A96E]/20 text-[#C9A96E] font-medium transition-all duration-300"
          >
            Extend Session
          </button>
          <button
            onClick={handleLogout}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#F5F0E8]/80 hover:text-white font-medium transition-all duration-300"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}
