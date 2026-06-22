"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import logo from "@/public/images/logo.png"
import { authService } from "@/services/auth.service"
import { getNames, getCode } from "country-list"
import countryToCurrency from "country-to-currency"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import "../globals.css"

// ─── Validation helpers ──────────────────────────────────────────────────────

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Common country calling codes
const COUNTRY_CODES = [
  { code: "+91", country: "IN", label: "🇮🇳 +91" },
  { code: "+1", country: "US", label: "🇺🇸 +1" },
  { code: "+44", country: "GB", label: "🇬🇧 +44" },
  { code: "+61", country: "AU", label: "🇦🇺 +61" },
  { code: "+971", country: "AE", label: "🇦🇪 +971" },
  { code: "+966", country: "SA", label: "🇸🇦 +966" },
  { code: "+49", country: "DE", label: "🇩🇪 +49" },
  { code: "+33", country: "FR", label: "🇫🇷 +33" },
  { code: "+39", country: "IT", label: "🇮🇹 +39" },
  { code: "+34", country: "ES", label: "🇪🇸 +34" },
  { code: "+81", country: "JP", label: "🇯🇵 +81" },
  { code: "+82", country: "KR", label: "🇰🇷 +82" },
  { code: "+86", country: "CN", label: "🇨🇳 +86" },
  { code: "+55", country: "BR", label: "🇧🇷 +55" },
  { code: "+27", country: "ZA", label: "🇿🇦 +27" },
  { code: "+234", country: "NG", label: "🇳🇬 +234" },
  { code: "+254", country: "KE", label: "🇰🇪 +254" },
  { code: "+65", country: "SG", label: "🇸🇬 +65" },
  { code: "+60", country: "MY", label: "🇲🇾 +60" },
  { code: "+63", country: "PH", label: "🇵🇭 +63" },
  { code: "+62", country: "ID", label: "🇮🇩 +62" },
  { code: "+66", country: "TH", label: "🇹🇭 +66" },
  { code: "+7", country: "RU", label: "🇷🇺 +7" },
  { code: "+52", country: "MX", label: "🇲🇽 +52" },
  { code: "+48", country: "PL", label: "🇵🇱 +48" },
  { code: "+31", country: "NL", label: "🇳🇱 +31" },
  { code: "+46", country: "SE", label: "🇸🇪 +46" },
  { code: "+41", country: "CH", label: "🇨🇭 +41" },
  { code: "+43", country: "AT", label: "🇦🇹 +43" },
  { code: "+64", country: "NZ", label: "🇳🇿 +64" },
  { code: "+353", country: "IE", label: "🇮🇪 +353" },
  { code: "+351", country: "PT", label: "🇵🇹 +351" },
  { code: "+90", country: "TR", label: "🇹🇷 +90" },
  { code: "+20", country: "EG", label: "🇪🇬 +20" },
  { code: "+92", country: "PK", label: "🇵🇰 +92" },
  { code: "+880", country: "BD", label: "🇧🇩 +880" },
  { code: "+94", country: "LK", label: "🇱🇰 +94" },
  { code: "+977", country: "NP", label: "🇳🇵 +977" },
]

const COUNTRY_PHONE_LENGTHS: Record<string, number | number[]> = {
  "+91": 10, // India
  "+1": 10,  // US / Canada
  "+44": 10, // UK
  "+61": 9,  // Australia
  "+971": 9, // UAE
  "+966": 9, // Saudi Arabia
  "+49": [10, 11], // Germany
  "+33": 9,  // France
  "+39": [9, 10], // Italy
  "+34": 9,  // Spain
  "+81": 10, // Japan
  "+82": [9, 10], // South Korea
  "+86": 11, // China
  "+55": 11, // Brazil
  "+27": 9,  // South Africa
  "+234": 10, // Nigeria
  "+254": 9,  // Kenya
  "+65": 8,   // Singapore
  "+60": [9, 10], // Malaysia
  "+63": 10, // Philippines
  "+62": [10, 11, 12], // Indonesia
  "+66": 9,  // Thailand
  "+7": 10,  // Russia
  "+52": 10, // Mexico
  "+48": 9,  // Poland
  "+31": 9,  // Netherlands
  "+46": 9,  // Sweden
  "+41": 9,  // Switzerland
  "+43": [10, 11, 12, 13], // Austria
  "+64": [8, 9, 10], // New Zealand
  "+353": 9, // Ireland
  "+351": 9, // Portugal
  "+90": 10, // Turkey
  "+20": 10, // Egypt
  "+92": 10, // Pakistan
  "+880": 10, // Bangladesh
  "+94": 9,  // Sri Lanka
  "+977": 10, // Nepal
}

function validatePhone(phone: string, phoneCode: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null // not yet typed

  const limit = COUNTRY_PHONE_LENGTHS[phoneCode]
  if (limit) {
    if (Array.isArray(limit)) {
      if (!limit.includes(digits.length)) {
        const lengthsStr = limit.slice(0, -1).join(", ") + " or " + limit[limit.length - 1]
        return `Phone number must be ${lengthsStr} digits for ${phoneCode}`
      }
    } else {
      if (digits.length !== limit) {
        return `Phone number must be exactly ${limit} digits for ${phoneCode}`
      }
    }
  } else {
    if (digits.length < 6 || digits.length > 15) {
      return "Enter a valid phone number"
    }
  }
  return ""
}

function validateEmail(v: string): string | null {
  if (!v) return null
  if (!EMAIL_REGEX.test(v)) return "Enter a valid email address"
  return ""
}

function validatePassword(v: string): { message: string; checks: { label: string; pass: boolean }[] } | null {
  if (!v) return null
  const checks = [
    { label: "At least 8 characters", pass: v.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(v) },
    { label: "One digit", pass: /\d/.test(v) },
    { label: "One special character", pass: /[!@#$%^&*(),.?":{}|<>_\-+=/\\]/.test(v) },
  ]
  const allPass = checks.every((c) => c.pass)
  return { message: allPass ? "Strong password ✓" : "Password requirements:", checks }
}

// ─── Role-specific signup fields for Step 2 ──────────────────────────────────

type FieldDef = {
  id: string
  label: string
  type: "text" | "number" | "select" | "textarea"
  placeholder?: string
  options?: string[]
  isCurrency?: boolean  // true for money fields — label uses user's selected currency
}

const ROLE_FIELDS: Record<string, { heading: string; subtitle: string; fields: FieldDef[] }> = {
  Client: {
    heading: "Almost There",
    subtitle: "Confirm your location and preferences.",
    fields: [],
  },
  Designer: {
    heading: "Set Up Your Designer Profile",
    subtitle: "Showcase your style and attract the right clients.",
    fields: [
      { id: "bio", label: "Short Bio", type: "textarea", placeholder: "Tell clients about your design philosophy..." },
      { id: "specialization", label: "Specialization", type: "select", options: ["Interior Designer", "Exterior Designer", "AutoCAD Designer", "Structural Designer", "Landscape Designer", "3D Visualizer", "Mechanical Visualizer", "Vastu Consultant"] },
      { id: "style", label: "Signature Style", type: "select", options: ["Modern", "Minimalist", "Luxury", "Scandinavian", "Industrial", "Eclectic"] },
      { id: "experience", label: "Years of Experience", type: "number", placeholder: "e.g. 5" },
      { id: "rate", label: "Hourly Rate", type: "number", placeholder: "e.g. 80", isCurrency: true },
    ],
  },
  Architect: {
    heading: "Set Up Your Architect Profile",
    subtitle: "Highlight your expertise and win more projects.",
    fields: [
      { id: "bio", label: "Short Bio", type: "textarea", placeholder: "Describe your architectural approach..." },
      { id: "license", label: "(COA)License Number", type: "text", placeholder: "e.g. AR-123456" },
      { id: "specialization", label: "Project Type", type: "select", options: ["Residential", "Commercial", "Mixed-Use", "Industrial", "Urban Planning", "Renovation"] },
      { id: "software", label: "Primary Software", type: "select", options: ["AutoCAD", "Revit", "ArchiCAD", "SketchUp", "Rhino", "BIM 360"] },
      { id: "experience", label: "Years of Experience", type: "number", placeholder: "e.g. 10" },
      { id: "projectBudgetMax", label: "Max Project Budget", type: "number", placeholder: "e.g. 500000", isCurrency: true },
    ],
  },
  Contractor: {
    heading: "Set Up Your Contractor Profile",
    subtitle: "Show clients what you can build.",
    fields: [
      { id: "bio", label: "Company / Personal Bio", type: "textarea", placeholder: "Describe your contracting services..." },
      { id: "trade", label: "Primary Trade", type: "select", options: ["General Contractor", "Electrical", "Plumbing", "Carpentry", "Masonry", "Painting", "HVAC", "Roofing", "Other"] },
      { id: "gstin", label: "GSTIN Number", type: "text", placeholder: "e.g. 22AAAAA0000A1Z5" },
      { id: "experience", label: "Years of Experience", type: "number", placeholder: "e.g. 8" },
      { id: "teamSize", label: "Team Size (Optional)", type: "number", placeholder: "e.g. 12" },
    ],
  },
}

// ─── GSTIN validation ────────────────────────────────────────────────────────
// Format: 2 digits (state) + 5 uppercase letters (PAN) + 4 digits + 1 uppercase letter + 1 alphanumeric + Z + 1 alphanumeric
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

function validateGSTIN(value: string): { valid: boolean; message: string } {
  const trimmed = value.trim().toUpperCase()
  if (trimmed.length === 0) return { valid: false, message: "GSTIN is required" }
  if (trimmed.length !== 15) return { valid: false, message: `Must be 15 characters (currently ${trimmed.length})` }
  if (trimmed !== value.trim()) return { valid: false, message: "Must be uppercase" }
  if (!GSTIN_REGEX.test(trimmed)) return { valid: false, message: "Invalid GSTIN format" }
  return { valid: true, message: "Valid GSTIN ✓" }
}

// ─── Component ───────────────────────────────────────────────────────────────

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [role, setRole] = useState("")
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup")
  const [email, setEmail] = useState("")
  const [country, setCountry] = useState("")
  const [location, setLocation] = useState("")
  const countries = getNames()
  const [currency, setCurrency] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneCode, setPhoneCode] = useState("+91")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpMessage, setOtpMessage] = useState("")

  const handleSendOTP = async () => {
    if (!email.trim() || emailError) {
      setError("Please enter a valid email address first")
      return
    }
    if (!phone.trim() || phoneError) {
      setError("Please enter a valid phone number first")
      return
    }
    setOtpLoading(true)
    setOtpMessage("")
    setError("")
    try {
      const fullPhone = `${phoneCode}${phone}`
      const response = await authService.sendOtp(email.trim(), fullPhone)
      if (response.success) {
        setOtpSent(true)
        setOtpMessage("OTP sent successfully to your email!")
      } else {
        setError(response.message || "Failed to send OTP")
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP. Please check your credentials.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length < 6) {
      setError("Please enter a valid 6-digit OTP code")
      return
    }
    setOtpLoading(true)
    setOtpMessage("")
    setError("")
    try {
      const fullPhone = `${phoneCode}${phone}`
      const response = await authService.verifyOtp(fullPhone, otpCode.trim())
      if (response.success) {
        setOtpVerified(true)
        setOtpMessage("Email verified successfully!")
      } else {
        setError(response.message || "Invalid or expired OTP")
      }
    } catch (err: any) {
      setError(err?.message || "OTP verification failed.")
    } finally {
      setOtpLoading(false)
    }
  }

  const validateUsernameInput = (val: string) => {
    if (!val) return "Username is required"
    if (val.length < 3) return "Username must be at least 3 characters"
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return "Username can only contain letters, numbers, and underscores"
    return ""
  }

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState("")

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError("")
    setForgotSuccess(false)

    if (!forgotEmail.trim()) {
      setForgotError("Email is required")
      return
    }
    if (!EMAIL_REGEX.test(forgotEmail)) {
      setForgotError("Please enter a valid email address")
      return
    }

    setForgotLoading(true)
    try {
      await authService.forgotPassword(forgotEmail)
      setForgotSuccess(true)
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setForgotLoading(false)
    }
  }


  // Role-specific extra fields
  const [roleFields, setRoleFields] = useState<Record<string, string>>({})
  const [gstinStatus, setGstinStatus] = useState<{ valid: boolean; message: string } | null>(null)
  const [govtVerified, setGovtVerified] = useState(false)

  const setRoleField = (id: string, value: string) => {
    setRoleFields((prev) => ({ ...prev, [id]: value }))
    // Reset GSTIN status when value changes
    if (id === "gstin") setGstinStatus(null)
  }

  const handleVerifyGSTIN = () => {
    const result = validateGSTIN(roleFields.gstin || "")
    setGstinStatus(result)
    // Auto-uppercase the value
    if (roleFields.gstin) {
      setRoleFields((prev) => ({ ...prev, gstin: prev.gstin.trim().toUpperCase() }))
    }
  }

  // Computed validation state (recalculated each render)
  const phoneError = validatePhone(phone, phoneCode)
  const emailError = validateEmail(email)
  const usernameError = username ? validateUsernameInput(username) : null
  const passwordStatus = validatePassword(password)
  const passwordAllPass = passwordStatus?.checks.every((c) => c.pass) ?? false

  const handleNext = () => {
    if (!role) {
      setError("Please select a role")
      return
    }
    if (!fullName.trim() || !username.trim() || !email.trim() || !password || !phone.trim()) {
      setError("Please fill all required fields")
      return
    }
    const uError = validateUsernameInput(username)
    if (uError) {
      setError(uError)
      return
    }
    if (phoneError) {
      setError(phoneError)
      return
    }
    if (emailError) {
      setError(emailError)
      return
    }
    if (!otpVerified) {
      setError("Please verify your email via OTP before proceeding")
      return
    }
    if (!passwordAllPass) {
      setError("Password does not meet all requirements")
      return
    }
    if (!termsAccepted) {
      setError("You must accept the Terms and Conditions to proceed")
      return
    }
    setError("")
    setStep(2)
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          setLocation(data.display_name)
        } catch {
          setError("Unable to fetch location")
        }
      },
      () => setError("Location permission denied")
    )
  }

  // Returns the dashboard path based on role
  const getDashboardPath = (r: string) => {
    switch (r.toLowerCase()) {
      case "designer": return "/dashboard/designer"
      case "architect": return "/dashboard/architect"
      case "contractor": return "/dashboard/contractor"
      default: return "/dashboard/client"
    }
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError("")

    // Login validations
    if (!isSignUp) {
      if (!email.trim()) {
        setError("Email is required")
        return
      }
      if (!password) {
        setError("Password is required")
        return
      }
      if (emailError) {
        setError(emailError)
        return
      }
    } else {
      // Signup validations
      if (!role) {
        setError("Role is required")
        return
      }
      if (!fullName.trim() || !username.trim() || !email.trim() || !password || !phone.trim()) {
        setError("Please fill all step 1 fields")
        return
      }
      const uError = validateUsernameInput(username)
      if (uError) {
        setError(uError)
        return
      }
      if (phoneError) {
        setError(phoneError)
        return
      }
      if (emailError) {
        setError(emailError)
        return
      }
      if (!passwordAllPass) {
        setError("Password does not meet all requirements")
        return
      }
      if (!termsAccepted) {
        setError("You must accept the Terms and Conditions to proceed")
        return
      }
      if (!country) {
        setError("Country is required")
        return
      }
      if (!location) {
        setError("Location is required")
        return
      }

      // Validate role specific fields
      const fields = ROLE_FIELDS[role]?.fields || []
      for (const f of fields) {
        const val = roleFields[f.id]
        if (!val || !val.trim()) {
          setError(`${f.label} is required`)
          return
        }
      }

      if (role === "Contractor") {
        if (!gstinStatus || !gstinStatus.valid) {
          setError("Please enter and verify a valid GSTIN number")
          return
        }
      }
      if (role === "Designer" && (roleFields.specialization === "AutoCAD Designer" || roleFields.specialization === "Structural Designer")) {
        if (!govtVerified) {
          setError("You must verify with the government for AutoCAD or Structural Designer roles")
          return
        }
        if (!roleFields.licenseNumber || !roleFields.licenseNumber.trim()) {
          setError("License Number is required for AutoCAD or Structural Designer roles")
          return
        }
      }
    }

    setLoading(true)
    try {
      if (isSignUp) {
        const [firstName, ...rest] = fullName.trim().split(" ")
        const lastName = rest.join(" ") || ""
        await authService.register({
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          password,
          phone_number: phone,
          role: role.toLowerCase(),
          country,
          location,
          currency,
          ...roleFields,
        })
        const nextParam = searchParams.get("next")
        if (nextParam) {
          router.push(nextParam)
        } else {
          router.push(getDashboardPath(role))
        }
      } else {
        const user = await authService.login({ email, password })
        const nextParam = searchParams.get("next")
        if (nextParam) {
          router.push(nextParam)
        } else {
          router.push(getDashboardPath(user?.user?.role || "client"))
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong"
      if (
        !isSignUp &&
        (errMsg.toLowerCase().includes("credential") ||
          errMsg.toLowerCase().includes("invalid") ||
          errMsg.toLowerCase().includes("unauthorized") ||
          errMsg.toLowerCase().includes("auth") ||
          errMsg.toLowerCase().includes("failed"))
      ) {
        setError("Email or password is incorrect")
      } else {
        setError(errMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Google Sign-In ──
  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      const idToken = await firebaseUser.getIdToken()

      // Login/Register via Django backend using the Firebase ID token
      const res = await authService.loginWithGoogle(idToken, role || "client")
      const nextParam = searchParams.get("next")
      if (nextParam) {
        router.push(nextParam)
      } else {
        router.push(getDashboardPath(res.user?.role || role || "client"))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  // Role config for Step 2
  const roleConfig = role ? ROLE_FIELDS[role] : null

  // Input base class (reused)
  const inputClass =
    "w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-3.5 text-sm text-[#F5F0F8] placeholder-[#8B7355]/60 outline-none transition-all duration-300 focus:border-[#C9A96E]/25 focus:bg-[#C9A96E]/[0.08] hover:border-[#C9A96E]/18"

  return (
    <div className="relative min-h-screen w-full bg-[#0D0D0D]">
      {/* ── LOADING OVERLAY ── */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D0D0D]/75 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-[#C9A96E]/15 bg-[#141413] shadow-2xl max-w-sm w-full mx-4">
            <div className="relative flex items-center justify-center">
              {/* Outer ring */}
              <div className="w-16 h-16 border-2 border-[#C9A96E]/10 rounded-full" />
              {/* Spinner ring */}
              <div className="absolute w-16 h-16 border-t-2 border-r-2 border-b-2 border-transparent border-t-[#C9A96E] rounded-full animate-spin" />
              {/* Central small logo / dot */}
              <div className="absolute w-8 h-8 rounded-full border border-[#C9A96E]/30 flex items-center justify-center bg-[#C9A96E]/5">
                <span className="text-[#C9A96E] text-[10px] font-semibold tracking-wider">NOD</span>
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <p
                className="text-xl font-light tracking-wide text-[#F5F0F8]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {isSignUp ? "Creating Account" : "Authenticating"}
              </p>
              <p className="text-xs text-[#8B7355]/80 font-light tracking-wider animate-pulse">
                Please wait a moment...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── LEFT PANEL (fixed) ── */}
      <div className="hidden lg:flex w-[58%] flex-col justify-end overflow-hidden fixed inset-y-0 left-0 z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(/images/login-background.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/10" />

        <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
          <div className="w-14 h-14 rounded-full border border-[#C9A96E]/30 flex items-center justify-center bg-[#C9A96E]/5 backdrop-blur-sm">
            <Image src={logo} alt="Logo" className="w-14 h-14" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center">
              <h1 className="text-6xl font-bold leading-none text-[#F5F0F8]">N</h1>
              <div className="ml-1 leading-none">
                <p className="text-3xl font-semibold text-[#F5F0F8]">OD</p>
                <p className="text-xs tracking-[0.3em] text-[#F5F0F8]">IGHT OWL DESIGNERS</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-12 pb-16">
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[#F5F0F8]">Studio Est. 2018</p>
          <h1
            className="text-5xl xl:text-6xl font-light text-white leading-[1.1] mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Designing<br />
            <em className="not-italic text-[#C9A96E]">Timeless</em> Spaces
          </h1>
          <p className="text-sm text-white leading-relaxed max-w-xs">
            Luxury architectural and interior experiences crafted with precision and modern aesthetics.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL (scrollable) ── */}
      <div className="relative flex flex-col items-center justify-center px-8 py-12 bg-[#111110] border-l border-[#C9A96E]/8 lg:ml-[58%] min-h-screen">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)",
          }}
        />

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-12 self-start">
          <div className="w-9 h-9 rounded-full border border-[#C9A96E]/20 flex items-center justify-center bg-[#C9A96E]/5">
            <span className="text-white text-[10px] font-semibold tracking-wider">NOD</span>
          </div>
          <p className="text-white text-xs font-light tracking-[0.25em] uppercase">Night Owl Designers</p>
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-10">
            <h2
              className="text-4xl font-light text-[#F5F0F8] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {isSignUp
                ? step === 2 && roleConfig
                  ? roleConfig.heading
                  : "Create Account"
                : "Welcome Back"}
            </h2>
            <p className="text-sm text-white/50 tracking-wide">
              {isSignUp
                ? step === 2 && roleConfig
                  ? roleConfig.subtitle
                  : "Create your account to get started"
                : "Sign in to continue your experience"}
            </p>
          </div>

          <div className="mb-8 h-px bg-[#C9A96E]/10" />

          {/* ── SIGN-IN FORM ── */}
          {!isSignUp && (
            <div className="space-y-5">
              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className={inputClass}
                />
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`${inputClass} pr-12`}
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
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email)
                      setForgotError("")
                      setForgotSuccess(false)
                      setShowForgotModal(true)
                    }}
                    className="text-[11px] text-[#C9A96E]/50 hover:text-[#C9A96E] transition-colors tracking-wide"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SIGN-UP STEP 1 — shared fields ── */}
          {isSignUp && step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-3">
                  Select Role
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Client", "Designer", "Architect", "Contractor"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={`rounded-full px-4 py-2 text-xs transition-all duration-300 ${role === item
                        ? "bg-[#C9A96E] text-[#0D0D0D]"
                        : "bg-[#C9A96E]/8 text-[#B8A88A] hover:bg-[#C9A96E]/15"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
                  placeholder="johndoe123"
                  className={`${inputClass} ${usernameError === "" ? "border-green-500/20" : usernameError ? "border-red-400/20" : ""}`}
                  required
                />
                {usernameError !== null && (
                  <p className={`mt-1.5 text-[10px] ${usernameError ? "text-red-400/60" : "text-green-400/50"}`}>
                    {usernameError || "Valid username ✓"}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={phoneCode}
                    onChange={(e) => {
                      const newCode = e.target.value
                      setPhoneCode(newCode)
                      const limit = COUNTRY_PHONE_LENGTHS[newCode]
                      const maxLen = Array.isArray(limit) ? Math.max(...limit) : (limit || 15)
                      const digits = phone.replace(/\D/g, "")
                      if (digits.length > maxLen) {
                        setPhone(digits.slice(0, maxLen))
                      }
                    }}
                    className="w-110px shrink-0 rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-2 py-3.5 text-sm text-white outline-none transition-all duration-300 focus:border-[#C9A96E]/25 focus:bg-[#C9A96E]/[0.08] hover:border-[#C9A96E]/18 appearance-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((cc) => (
                      <option key={cc.code} value={cc.code} className="bg-[#1A1714]">
                        {cc.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      const limit = COUNTRY_PHONE_LENGTHS[phoneCode]
                      const maxLen = Array.isArray(limit) ? Math.max(...limit) : (limit || 15)
                      if (val.length <= maxLen) {
                        setPhone(val)
                      }
                    }}
                    placeholder={phoneCode === "+91" || phoneCode === "+1" ? "98765 43210" : "Phone number"}
                    className={`${inputClass} flex-1 ${phoneError === "" ? "border-green-500/20" : phoneError ? "border-red-400/20" : ""}`}
                  />
                </div>
                {phoneError !== null && (
                  <p className={`mt-1.5 text-[10px] ${phoneError ? "text-red-400/60" : "text-green-400/50"}`}>
                    {phoneError || "Valid phone number ✓"}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setOtpSent(false)
                      setOtpVerified(false)
                      setOtpCode("")
                      setOtpMessage("")
                    }}
                    disabled={otpVerified}
                    placeholder="name@email.com"
                    className={`${inputClass} flex-1 ${emailError === "" ? "border-green-500/20" : emailError ? "border-red-400/20" : ""} ${otpVerified ? "opacity-60 cursor-not-allowed border-green-500/30" : ""}`}
                  />
                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || emailError !== "" || !email.trim() || phoneError !== "" || !phone.trim()}
                      className="rounded-xl border border-[#C9A96E]/20 bg-[#C9A96E]/5 px-4 text-xs font-medium text-[#C9A96E] hover:bg-[#C9A96E]/12 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {otpLoading ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                    </button>
                  )}
                </div>
                {emailError !== null && (
                  <p className={`mt-1.5 text-[10px] ${emailError ? "text-red-400/60" : "text-green-400/50"}`}>
                    {emailError || "Valid email ✓"}
                  </p>
                )}
                {otpVerified && (
                  <p className="mt-1.5 text-[10px] text-green-400/50">
                    Email verified successfully ✓
                  </p>
                )}
              </div>

              {otpSent && !otpVerified && (
                <div className="group animate-fadeIn">
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Enter OTP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit OTP"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={otpLoading || otpCode.length < 6}
                      className="rounded-xl bg-[#C9A96E] text-black px-4 text-xs font-semibold hover:bg-[#C9A96E]/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {otpLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                  {otpMessage && (
                    <p className="mt-1.5 text-[10px] text-amber-400/70">
                      {otpMessage}
                    </p>
                  )}
                </div>
              )}

              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase, digit, special"
                    className={`${inputClass} pr-12 ${passwordAllPass ? "border-green-500/20" : password ? "border-[#C9A96E]/15" : ""}`}
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
                {passwordStatus && (
                  <div className="mt-2 space-y-1">
                    {passwordStatus.checks.map((c) => (
                      <p key={c.label} className={`text-[10px] flex items-center gap-1.5 ${c.pass ? "text-green-400/50" : "text-white/25"}`}>
                        <span className={`inline-block w-1 h-1 rounded-full ${c.pass ? "bg-green-400/60" : "bg-white/20"}`} />
                        {c.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="checkbox bg-[#C9A96E]/40 border-[#C9A96E]/20"
                />
                <label htmlFor="terms" className="text-xs text-white transition-colors">
                  I agree to the{" "}
                  <a href="#" className="">Terms and Conditions</a>
                </label>
              </div>
            </div>
          )}

          {/* ── SIGN-UP STEP 2 — country + role-specific fields ── */}
          {isSignUp && step === 2 && (
            <div className="space-y-5">

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white/60">✓</div>
                  <span className="text-[10px] text-white/30 tracking-wide">Account</span>
                </div>
                <div className="h-px flex-1 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#C9A96E] flex items-center justify-center text-[10px] text-[#0D0D0D] font-medium">2</div>
                  <span className="text-[10px] text-[#C9A96E]/70 tracking-wide capitalize">{role} Details</span>
                </div>
              </div>

              {/* Country */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-white mb-2">Country</label>
                <select
                  value={country}
                  onChange={(e) => {
                    const selectedName = e.target.value
                    setCountry(selectedName)
                    const code = getCode(selectedName)
                    setCurrency(code ? countryToCurrency[code] ?? "" : "")
                  }}
                  className={inputClass}
                >
                  <option value="" className="bg-[#1A1714]">Select Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c} className="bg-[#1A1714]">{c}</option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-white mb-2">Currency</label>
                <input
                  type="text"
                  value={currency}
                  readOnly
                  placeholder="Auto-filled from country"
                  className={`${inputClass} cursor-not-allowed opacity-60`}
                />
              </div>

              {/* Location */}
              <div className="group">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-white mb-2">Location</label>
                <button
                  type="button"
                  onClick={getLocation}
                  className={`${inputClass} text-left`}
                >
                  📍 Use Current Location
                </button>
                {location && (
                  <div className="mt-3 w-full rounded-xl border border-[#C9A96E]/12 bg-[#C9A96E]/5 px-4 py-3 text-sm text-[#B8A88A] wrap-break-words">
                    {location}
                  </div>
                )}
              </div>

              {/* Divider — role-specific section */}
              {roleConfig && (
                <>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-px flex-1 bg-white/8" />
                    <span className="text-[9px] text-white/20 tracking-[0.2em] uppercase">{role} Profile</span>
                    <div className="h-px flex-1 bg-white/8" />
                  </div>

                  {roleConfig.fields.map((field) => (
                    <div key={field.id} className="group">
                      <label className="block text-[10px] uppercase tracking-[0.3em] text-white mb-2">
                        {field.isCurrency ? `${field.label} (${currency || "USD"})` : field.label}
                      </label>

                      {field.type === "textarea" && (
                        <textarea
                          rows={3}
                          placeholder={field.placeholder}
                          value={roleFields[field.id] || ""}
                          onChange={(e) => setRoleField(field.id, e.target.value)}
                          className={inputClass}
                        />
                      )}

                      {(field.type === "text" || field.type === "number") && field.id !== "gstin" && (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={roleFields[field.id] || ""}
                          onChange={(e) => setRoleField(field.id, e.target.value)}
                          className={inputClass}
                        />
                      )}

                      {/* GSTIN field with verify button */}
                      {field.id === "gstin" && (
                        <div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={15}
                              placeholder={field.placeholder}
                              value={roleFields[field.id] || ""}
                              onChange={(e) => setRoleField(field.id, e.target.value.toUpperCase())}
                              className={`${inputClass} flex-1 font-mono tracking-wider uppercase ${gstinStatus
                                ? gstinStatus.valid
                                  ? "border-green-500/30 focus:border-green-500/50"
                                  : "border-red-400/30 focus:border-red-400/50"
                                : ""
                                }`}
                            />
                            <button
                              type="button"
                              onClick={handleVerifyGSTIN}
                              className="shrink-0 rounded-xl border border-[#C9A96E]/15 bg-[#C9A96E]/5 px-4 py-3.5 text-xs text-[#C9A96E]/70 hover:bg-[#C9A96E]/12 hover:text-[#C9A96E] transition-all duration-300 tracking-wide uppercase"
                            >
                              Verify
                            </button>
                          </div>
                          {gstinStatus && (
                            <p className={`mt-2 text-xs ${gstinStatus.valid
                              ? "text-green-400/70"
                              : "text-red-400/70"
                              }`}>
                              {gstinStatus.message}
                            </p>
                          )}
                          <p className="mt-1.5 text-[10px] text-white/20">
                            Format: 22AAAAA0000A1Z5 (15 characters, uppercase)
                          </p>
                        </div>
                      )}

                      {field.type === "select" && (
                        <select
                          value={roleFields[field.id] || ""}
                          onChange={(e) => {
                            setRoleField(field.id, e.target.value)
                            // Reset govt verified state when specialization changes
                            if (field.id === "specialization") {
                              setGovtVerified(false)
                              setRoleFields((prev) => ({ ...prev, licenseNumber: "" }))
                            }
                            // Clear "other specify" when not Other
                            if (field.id === "trade" && e.target.value !== "Other") {
                              setRoleFields((prev) => ({ ...prev, tradeOther: "" }))
                            }
                          }}
                          className={inputClass}
                        >
                          <option value="" className="bg-[#1A1714]">Select {field.label}</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#1A1714]">{opt}</option>
                          ))}
                        </select>
                      )}

                      {/* "Other" specify field for Primary Trade */}
                      {field.id === "trade" && roleFields.trade === "Other" && (
                        <div className="mt-3">
                          <label className="block text-[10px] uppercase tracking-[0.3em] text-white/35 mb-2">Please Specify *</label>
                          <input
                            type="text"
                            placeholder="Enter your trade"
                            value={roleFields.tradeOther || ""}
                            onChange={(e) => setRoleField("tradeOther", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      )}

                      {/* Government Verified — only for AutoCAD / Structural Designer */}
                      {field.id === "specialization" && (roleFields.specialization === "AutoCAD Designer" || roleFields.specialization === "Structural Designer") && (
                        <div className="mt-4 space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div
                              className={`w-5 h-5 rounded-md border transition-all duration-300 flex items-center justify-center ${govtVerified
                                ? "bg-[#C9A96E] border-[#C9A96E]"
                                : "border-[#C9A96E]/20 bg-[#C9A96E]/5 group-hover:border-[#C9A96E]/30"
                                }`}
                              onClick={() => setGovtVerified(!govtVerified)}
                            >
                              {govtVerified && (
                                <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                              Government Verified
                            </span>
                          </label>

                          {govtVerified && (
                            <div>
                              <label className="block text-[10px] uppercase tracking-[0.3em] text-white/35 mb-2">License Number *</label>
                              <input
                                type="text"
                                placeholder="Enter your government license number"
                                value={roleFields.licenseNumber || ""}
                                onChange={(e) => setRoleField("licenseNumber", e.target.value)}
                                className={inputClass}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 text-center text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {isSignUp && step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-4 mt-8 text-[#8B7355] text-sm hover:text-[#C9A96E] transition-colors"
            >
              ← Back
            </button>
          )}

          <button
            onClick={(e) => {
              if (isSignUp && step === 1) {
                handleNext()
              } else {
                handleSubmit(e)
              }
            }}
            disabled={loading || (isSignUp && step === 1 && (!termsAccepted || !otpVerified))}
            className="mt-5 w-full rounded-full bg-linear-to-r from-[#C9A96E] to-[#B8944F] py-3.5 text-sm font-medium tracking-[0.15em] uppercase text-[#0D0D0D] transition-all duration-300 hover:shadow-[0_0_25px_rgba(201,169,110,0.2)] hover:tracking-[0.2em] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isSignUp ? (step === 1 ? "Next" : "Create Account") : "Sign In"}
          </button>

          {!isSignUp && (
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#C9A96E]/8" />
              <span className="text-[10px] text-[#8B7355]/50 tracking-widest uppercase">or</span>
              <div className="h-px flex-1 bg-[#C9A96E]/8" />
            </div>
          )}

          <p className="text-center text-xs text-[#8B7355] mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setStep(1); setError(""); setRoleFields({}) }}
              className="ml-1 text-white/60 hover:text-white"
            >
              {isSignUp ? "Sign In" : "Create One"}
            </button>
          </p>

          {!isSignUp && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn mt-4 w-full bg-[#F5F0E8] text-[#0D0D0D] border-[#C9A96E]/20 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium hover:bg-[#E8D5B5] transition-colors disabled:opacity-50"
            >
              <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <g>
                  <path d="m0 0H512V512H0" fill="#fff" />
                  <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
                  <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
                  <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
                  <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
                </g>
              </svg>
              {loading ? "Signing in…" : "Continue with Google"}
            </button>
          )}
        </div>

        <p className="absolute bottom-6 right-8 text-[10px] text-[#6B5A42] tracking-[0.3em] uppercase">
          © 2026 NOD
        </p>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#C9A96E]/15 bg-[#141413] p-8 shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-[#C9A96E] to-transparent" />

            {/* Close button */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-[#C9A96E] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {!forgotSuccess ? (
              <form onSubmit={handleForgotSubmit} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-light text-[#F5F0F8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Recover Password
                  </h3>
                  <p className="mt-1 text-xs text-white/50">
                    Enter your email address to receive a link to reset your password.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-[#F5F0F8]">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@email.com"
                    className={inputClass}
                    disabled={forgotLoading}
                  />
                </div>

                {forgotError && (
                  <p className="text-xs text-[#C45C4D] bg-[#C45C4D]/5 border border-[#C45C4D]/10 rounded-xl px-4 py-2.5">
                    {forgotError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 rounded-full border border-[#C9A96E]/12 py-3 text-xs uppercase tracking-wider text-white/60 hover:bg-[#C9A96E]/5 hover:text-white transition-colors"
                    disabled={forgotLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-linear-to-r from-[#C9A96E] to-[#B8944F] py-3 text-xs font-medium uppercase tracking-wider text-[#0D0D0D] transition-all hover:shadow-[0_0_20px_rgba(201,169,110,0.15)] disabled:opacity-50"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Sending..." : "Send Link"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="mx-auto w-12 h-12 rounded-full border border-green-500/30 bg-green-500/5 flex items-center justify-center text-green-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-light text-[#F5F0F8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Email Sent
                  </h3>
                  <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
                    If your email is registered with us, you will receive a password reset link shortly. Please check your inbox and spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full rounded-full bg-linear-to-r from-[#C9A96E] to-[#B8944F] py-3 text-xs font-medium uppercase tracking-wider text-[#0D0D0D] transition-all"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-[#C9A96E]/15 border-t-[#C9A96E]/60 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}