"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import logo from "@/public/images/logo.png"
import { authService } from "@/services/auth.service"
import "../globals.css"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Password Validation
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One digit", pass: /\d/.test(password) },
    { label: "One special character", pass: /[!@#$%^&*(),.?":{}|<>_\-+=/\\]/.test(password) },
  ]
  
  const allChecksPass = checks.every((c) => c.pass)
  const matchPass = password && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new link.")
      return
    }

    if (!allChecksPass) {
      setError("Password does not meet the security requirements.")
      return
    }

    if (!matchPass) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await authService.resetPassword({
        token,
        new_password: password,
      })
      if (res.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(res.message || "Failed to reset password.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-3.5 text-sm text-[#F5F0F8] placeholder-[#8B7355]/60 outline-none transition-all duration-300 focus:border-[#C9A96E]/25 focus:bg-[#C9A96E]/[0.08] hover:border-[#C9A96E]/18"

  return (
    <div className="relative min-h-screen w-full bg-[#0D0D0D] flex items-center justify-center p-6">
      {/* Decorative grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#C9A96E]/15 bg-[#111110] p-8 md:p-10 shadow-2xl transition-all duration-300">
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-[#C9A96E] to-transparent" />

        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full border border-[#C9A96E]/30 flex items-center justify-center bg-[#C9A96E]/5 backdrop-blur-sm mb-4">
            <Image src={logo} alt="Logo" className="w-14 h-14" />
          </div>
          <h1 className="text-white text-xs font-light tracking-[0.25em] uppercase">Night Owl Designers</h1>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-light text-[#F5F0F8] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Reset Password
          </h2>
          <p className="text-xs text-white/50">
            Please enter your new password below.
          </p>
        </div>

        {!token && (
          <div className="text-center py-4 space-y-4">
            <p className="text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-3">
              Invalid Request: Reset token is missing from the URL. Please request a new link.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="text-xs text-[#C9A96E] hover:text-[#E8D5B5] transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {token && !success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={`${inputClass} pr-12`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5A42] hover:text-[#C9A96E] transition-colors"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Checklist */}
              {password && (
                <div className="mt-2 space-y-1">
                  {checks.map((c) => (
                    <p key={c.label} className={`text-[10px] flex items-center gap-1.5 ${c.pass ? "text-green-400/60" : "text-white/25"}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.pass ? "bg-green-400/70" : "bg-white/20"}`} />
                      {c.label}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={inputClass}
                disabled={loading}
              />
              {confirmPassword && (
                <p className={`mt-2 text-[10px] flex items-center gap-1.5 ${matchPass ? "text-green-400/60" : "text-red-400/60"}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${matchPass ? "bg-green-400/70" : "bg-red-400/70"}`} />
                  {matchPass ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !allChecksPass || !matchPass}
              className="mt-6 w-full rounded-full bg-linear-to-r from-[#C9A96E] to-[#B8944F] py-3.5 text-sm font-medium tracking-[0.15em] uppercase text-[#0D0D0D] transition-all duration-300 hover:shadow-[0_0_25px_rgba(201,169,110,0.2)] hover:tracking-[0.2em] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-xs text-[#8B7355] hover:text-[#C9A96E] transition-colors"
              >
                ← Return to Sign In
              </button>
            </div>
          </form>
        )}

        {success && (
          <div className="text-center py-6 space-y-6">
            <div className="mx-auto w-12 h-12 rounded-full border border-green-500/30 bg-green-500/5 flex items-center justify-center text-green-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-light text-[#F5F0F8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Success!
              </h3>
              <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
                Your password has been reset successfully. Redirecting you to the sign-in page...
              </p>
            </div>
            <div className="w-8 h-8 mx-auto border-2 border-[#C9A96E]/15 border-t-[#C9A96E]/60 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-[#C9A96E]/15 border-t-[#C9A96E]/60 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
