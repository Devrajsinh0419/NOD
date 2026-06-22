"use client"

import { useEffect, useState } from "react"
import { authService } from "@/services/auth.service"
import { walletService } from "@/services/wallet.service"
import type { WalletData, WalletTransaction, BankAccountData } from "@/types/wallet.types"
import { formatToUserCurrency, getUserCurrency, convertCurrency } from "@/utils/currency"

export default function WalletView() {
  const [userId, setUserId] = useState<number | null>(null)
  const [role, setRole] = useState<string>("designer")
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Bank Form state
  const [showBankForm, setShowBankForm] = useState(false)
  const [bankName, setBankName] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [ifscCode, setIfscCode] = useState("")
  const [bankSubmitting, setBankSubmitting] = useState(false)

  // Withdraw Modal state
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [amountInput, setAmountInput] = useState("")
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    loadWalletData()
  }, [])

  async function loadWalletData() {
    try {
      setLoading(true)
      setError("")
      const user = authService.getStoredUser() || await authService.getMe()
      if (user && user.id) {
        setUserId(user.id)
        setRole(user.role?.toLowerCase() || "designer")

        // Safety check - clients shouldn't have access to this component
        if (user.role?.toLowerCase() === "client") {
          setError("Wallet access is restricted to professionals.")
          return
        }

        const data = await walletService.getWallet(user.id)
        setWallet(data)

        // Pre-fill bank form fields if any exist
        if (data.bank_accounts && data.bank_accounts.length > 0) {
          const mainBank = data.bank_accounts[0]
          setBankName(mainBank.bank_name)
          setAccountHolderName(mainBank.account_holder_name)
          setAccountNumber(mainBank.account_number)
          setIfscCode(mainBank.ifsc_code)
        }
      } else {
        setError("Failed to resolve user profile.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet data")
    } finally {
      setLoading(false)
    }
  }

  const handleLinkBank = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || bankSubmitting) return
    if (!bankName || !accountHolderName || !accountNumber || !ifscCode) {
      alert("All bank details are required.")
      return
    }

    try {
      setBankSubmitting(true)
      await walletService.linkBankAccount(userId, {
        bank_name: bankName,
        account_holder_name: accountHolderName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
      })
      alert("Bank account linked successfully!")
      setShowBankForm(false)
      // Reload wallet data
      const data = await walletService.getWallet(userId)
      setWallet(data)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to link bank account.")
    } finally {
      setBankSubmitting(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !amountInput || modalLoading) return
    const amt = parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid withdrawal amount.")
      return
    }

    const userCurrency = getUserCurrency()
    const amtInINR = convertCurrency(amt, userCurrency, "INR")

    if (amtInINR < 100) {
      alert(`Minimum withdrawal amount is ${formatToUserCurrency(100, "INR")}`)
      return
    }

    if (wallet && wallet.balance < amtInINR) {
      alert("Insufficient available balance.")
      return
    }

    try {
      setModalLoading(true)
      const res = await walletService.withdraw(userId, amtInINR)
      alert(res.transaction.description || `Successfully requested withdrawal of ${formatToUserCurrency(amtInINR, "INR")}`)
      setShowWithdraw(false)
      setAmountInput("")
      // Reload wallet
      const data = await walletService.getWallet(userId)
      setWallet(data)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to initiate withdrawal")
    } finally {
      setModalLoading(false)
    }
  }

  const formatCurrency = (val: number) => {
    return formatToUserCurrency(val, "INR")
  }

  const formatShortDate = (isoStr: string) => {
    if (!isoStr) return ""
    const d = new Date(isoStr)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  const getTxTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit"
      case "withdrawal":
      case "WITHDRAWAL_REQUEST":
        return "Withdrawal Request"
      case "WITHDRAWAL_COMPLETED":
        return "Withdrawal Succeeded"
      case "release":
      case "ESCROW_RELEASE":
        return "Payment Released"
      case "escrow":
      case "ESCROW_HOLD":
        return "Escrow Hold"
      case "ADVANCE_PAYMENT":
        return "Advance Payment"
      case "FINAL_PAYMENT":
        return "Final Payment"
      case "CLIENT_PLATFORM_FEE":
        return "Client Platform Fee"
      case "PROFESSIONAL_PLATFORM_FEE":
        return "Professional Fee Deduction"
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    }
  }

  const getTxBadgeStyles = (type: string, status: string) => {
    const isCompleted = status.toLowerCase() === "completed" || status.toLowerCase() === "processed"
    if (!isCompleted) {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    }

    if (type.includes("RELEASE") || type.includes("deposit") || type.includes("release")) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    }
    if (type.includes("FEE") || type.includes("platform_charge")) {
      return "bg-gray-500/10 text-gray-400 border border-gray-500/20"
    }
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
  }

  const linkedBank = wallet?.bank_accounts && wallet.bank_accounts.length > 0 ? wallet.bank_accounts[0] : null

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 text-[#F5F0E8] animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-light tracking-wide font-serif text-[#F5F0E8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Professional Wallet
          </h2>
          <p className="text-xs text-[#8B7355] font-light">
            Manage your earnings, view escrow-protected milestones, and link bank credentials for withdrawals.
          </p>
        </div>

        {wallet && (
          <button
            onClick={() => {
              if (!linkedBank) {
                alert("Please link a bank account before requesting withdrawals.")
                setShowBankForm(true)
                return
              }
              setAmountInput("")
              setShowWithdraw(true)
            }}
            disabled={wallet.balance <= 0}
            className={`w-full md:w-auto text-center px-8 py-3 rounded-full font-serif tracking-widest text-xs uppercase transition-all duration-300 ${wallet.balance > 0
              ? "bg-gradient-to-r from-[#C9A96E] to-[#B8944F] text-[#0D0D0D] font-bold shadow-lg hover:shadow-[#C9A96E]/20 hover:scale-[1.02]"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
          >
            Withdraw Balance
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-4 border-[#C9A96E]/12 border-t-[#C9A96E] rounded-full animate-spin" />
          <span className="text-xs text-[#C9A96E] tracking-widest uppercase font-light">Loading Wallet metrics...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs tracking-wide text-center">
          {error}
        </div>
      ) : wallet ? (
        <div className="grid grid-cols-1 gap-8">
          {/* 4 Dashboard Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Available Balance */}
            <div className="relative overflow-hidden rounded-2xl border border-[#C9A96E]/40 bg-white p-6 space-y-3 transition-transform hover:scale-[1.01] duration-300 shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A96E]/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[10px] text-[#8B7355] uppercase tracking-widest font-semibold">
                Available Balance
              </p>
              <h3 className="text-3xl font-light tracking-wide text-black font-serif">
                {formatCurrency(wallet.balance)}
              </h3>
              <p className="text-[10px] text-emerald-500/80 font-light tracking-wider">
                Directly withdrawable to bank
              </p>
            </div>

            {/* Card 2: Escrow Protected */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-white p-6 space-y-3 transition-transform hover:scale-[1.01] duration-300 shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[10px] text-[#8B7355] uppercase tracking-widest font-semibold">
                Escrow Protected
              </p>
              <h3 className="text-3xl font-light tracking-wide text-black font-serif">
                {formatCurrency(wallet.escrow_balance)}
              </h3>
              <p className="text-[10px] text-amber-500/80 font-light tracking-wider">
                Milestone secured payments
              </p>
            </div>

            {/* Card 3: Pending Withdrawals */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-white p-6 space-y-3 transition-transform hover:scale-[1.01] duration-300 shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[10px] text-[#8B7355] uppercase tracking-widest font-semibold">
                Pending Withdrawals
              </p>
              <h3 className="text-3xl font-light tracking-wide text-black font-serif">
                {formatCurrency(wallet.pending_withdrawals)}
              </h3>
              <p className="text-[10px] text-blue-500/80 font-light tracking-wider">
                In process / bank verification
              </p>
            </div>

            {/* Card 4: Lifetime Earnings */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-white p-6 space-y-3 transition-transform hover:scale-[1.01] duration-300 shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[10px] text-[#8B7355] uppercase tracking-widest font-semibold">
                Lifetime Earnings
              </p>
              <h3 className="text-3xl font-light tracking-wide text-black font-serif">
                {formatCurrency(wallet.lifetime_earnings)}
              </h3>
              <p className="text-[10px] text-emerald-500/80 font-light tracking-wider">
                Total released payout volume
              </p>
            </div>
          </div>

          {/* Bank Accounts section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#111111] border border-[#C9A96E]/20 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase tracking-widest font-serif text-[#C9A96E]">
                    Linked Bank Credentials
                  </h4>
                  {linkedBank && (
                    <button
                      onClick={() => setShowBankForm(!showBankForm)}
                      className="text-[10px] font-mono text-[#8B7355] hover:text-[#C9A96E] uppercase underline tracking-wider"
                    >
                      {showBankForm ? "Cancel" : "Update Bank"}
                    </button>
                  )}
                </div>

                {linkedBank && !showBankForm ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-emerald-400">Verified Active Account</span>
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="border-t border-[#C9A96E]/10 pt-2 space-y-1">
                        <p className="text-[10px] text-[#8B7355] uppercase">Bank Name</p>
                        <p className="text-xs text-white font-medium">{linkedBank.bank_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-[#8B7355] uppercase">Account Holder</p>
                        <p className="text-xs text-white font-medium">{linkedBank.account_holder_name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-[10px] text-[#8B7355] uppercase">Account Number</p>
                          <p className="text-xs text-white font-mono font-medium">
                            •••• •••• {linkedBank.account_number.slice(-4)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-[#8B7355] uppercase">IFSC Code</p>
                          <p className="text-xs text-white font-mono font-medium">{linkedBank.ifsc_code}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLinkBank} className="space-y-4">
                    {!linkedBank && (
                      <p className="text-[11px] text-[#8B7355] font-light leading-relaxed">
                        No bank credentials linked yet. You must link your account details before request withdrawal.
                      </p>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#8B7355]">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        required
                        className="w-full rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/15 px-4 py-3 text-xs text-[#F5F0E8] placeholder-[#8B7355]/40 outline-none focus:border-[#C9A96E]/40 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#8B7355]">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="Holder Full Name"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        required
                        className="w-full rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/15 px-4 py-3 text-xs text-[#F5F0E8] placeholder-[#8B7355]/40 outline-none focus:border-[#C9A96E]/40 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#8B7355]">Account Number</label>
                      <input
                        type="text"
                        placeholder="Enter Bank Account No."
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                        className="w-full rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/15 px-4 py-3 text-xs text-[#F5F0E8] placeholder-[#8B7355]/40 outline-none focus:border-[#C9A96E]/40 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-[#8B7355]">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0001234"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        required
                        className="w-full rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/15 px-4 py-3 text-xs text-[#F5F0E8] placeholder-[#8B7355]/40 outline-none focus:border-[#C9A96E]/40 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={bankSubmitting}
                      className="w-full py-3 mt-2 rounded-xl bg-[#C9A96E]/60 hover:bg-[#B8944F] text-[#0D0D0D] text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {bankSubmitting ? "Linking Details..." : "Link Bank Details"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#111111] border border-[#C9A96E]/20 rounded-2xl p-6">
                <h4 className="text-xs uppercase tracking-widest font-serif text-[#C9A96E] mb-6 text-center">
                  Recent Wallet Activities
                </h4>

                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {wallet.transactions.length === 0 ? (
                    <p className="text-[11px] text-[#6B5A42] text-center py-16 italic font-light">
                      No transactional activity recorded yet.
                    </p>
                  ) : (
                    wallet.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="rounded-xl border border-[#C9A96E]/10 bg-[#1A1816]/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C9A96E]/25 transition-all"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${getTxBadgeStyles(tx.transaction_type, tx.status)}`}>
                              {getTxTypeLabel(tx.transaction_type)}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">ID: #{tx.id}</span>
                          </div>
                          <p className="text-xs font-normal text-[#F5F0E8] leading-relaxed">
                            {tx.description}
                          </p>
                          <p className="text-[9px] text-[#8B7355]">
                            {formatShortDate(tx.created_at)}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold font-serif text-white tracking-wide">
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal: Withdraw */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#C9A96E]/30 bg-[#111111] p-6 space-y-6 shadow-2xl animate-scaleUp">
            <div className="space-y-1 text-center">
              <h3 className="text-xl font-light tracking-wide font-serif text-[#C9A96E]">Request Withdrawal</h3>
              <p className="text-[10px] text-[#8B7355]">Specify withdrawal amount. Payout will process to linked bank account.</p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[#8B7355]">Payout Bank Account</label>
                <div className="p-3 rounded-xl bg-white/2 border border-white/5 text-xs text-white/70 font-mono">
                  {linkedBank?.bank_name} (•••• {linkedBank?.account_number.slice(-4)})
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-[#8B7355]">Amount to Withdraw</label>
                <input
                  type="number"
                  placeholder={`Amount (${getUserCurrency()})`}
                  required
                  min={convertCurrency(100, "INR", getUserCurrency())}
                  max={wallet ? convertCurrency(wallet.balance, "INR", getUserCurrency()) : 0}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/20 px-4 py-3 text-xs text-[#F5F0E8] placeholder-[#8B7355]/40 outline-none focus:border-[#C9A96E]/40"
                />
                <div className="flex justify-between text-[9px] text-[#8B7355] pt-1">
                  <span>Available: {formatCurrency(wallet?.balance || 0)}</span>
                  <span>Min: {formatToUserCurrency(100, "INR")}</span>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[#C9A96E]/10">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold text-[#8B7355] hover:text-white transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#B8944F] text-[#0D0D0D] text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 text-center"
                >
                  {modalLoading ? "Requesting..." : "Confirm Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
