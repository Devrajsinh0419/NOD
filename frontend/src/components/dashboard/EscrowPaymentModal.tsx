"use client"

import { useEffect, useState } from "react"
import { projectService } from "@/services/project.service"

interface EscrowPaymentModalProps {
  isOpen: boolean
  mode: "accept_bid" | "complete_project"
  targetId: number // bidId for accept_bid, projectId for complete_project
  onClose: () => void
  onSuccess: (data: any) => void
}

export default function EscrowPaymentModal({
  isOpen,
  mode,
  targetId,
  onClose,
  onSuccess,
}: EscrowPaymentModalProps) {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState<{
    bidAmount: number
    advanceAmount?: number
    clientFee?: number
    remainingAmount?: number
    totalPayable: number
  } | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadPaymentSummary()
    }
  }, [isOpen, mode, targetId])

  async function loadPaymentSummary() {
    try {
      setLoading(true)
      setError("")
      if (mode === "accept_bid") {
        const res = await projectService.getBidPaymentSummary(targetId)
        setSummary({
          bidAmount: res.bid_amount,
          advanceAmount: res.advance_amount,
          clientFee: res.client_fee,
          totalPayable: res.total_payable,
        })
      } else {
        const res = await projectService.getProjectPaymentSummary(targetId)
        setSummary({
          bidAmount: res.bid_amount,
          remainingAmount: res.remaining_amount,
          totalPayable: res.total_payable,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment summary details")
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayment = async () => {
    try {
      setProcessing(true)
      setError("")
      
      // Simulate dummy payment gateway response delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (mode === "accept_bid") {
        const res = await projectService.acceptBid(targetId)
        if (res.success) {
          alert(res.message || "Escrow advance payment secured successfully!")
          onSuccess(res)
        } else {
          throw new Error(res.message || "Failed to process bid acceptance escrow payment")
        }
      } else {
        const res = await projectService.approveProjectCompletion(targetId)
        if (res.success) {
          alert(res.message || "Project marked as completed. Milestone payout released to professional's wallet!")
          onSuccess(res)
        } else {
          throw new Error(res.message || "Failed to process project approval release payout")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment processing failed")
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#C9A96E]/30 bg-[#111111] p-6 space-y-6 shadow-2xl animate-scaleUp text-[#F5F0E8]">
        {/* Modal Header */}
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-light font-serif text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {mode === "accept_bid" ? "Secure Escrow Payment" : "Release Final Payment"}
          </h3>
          <p className="text-[10px] text-[#8B7355] tracking-wider uppercase font-semibold">
            {mode === "accept_bid" ? "Advance Deposit Summary" : "Milestone Completion Payout"}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-[#C9A96E]/12 border-t-[#C9A96E] rounded-full animate-spin" />
            <span className="text-[10px] text-[#8B7355] tracking-widest uppercase font-light">Retrieving payment parameters...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs text-center">
            {error}
            <button
              onClick={loadPaymentSummary}
              className="block mx-auto mt-2 text-[10px] underline text-[#C9A96E]"
            >
              Retry
            </button>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* Breakdown Card */}
            <div className="p-5 rounded-2xl border border-[#C9A96E]/15 bg-[#1B1917]/50 space-y-4">
              <div className="flex justify-between text-xs text-[#8B7355] pb-2 border-b border-[#C9A96E]/10">
                <span>Total Bid Payout</span>
                <span className="font-semibold text-[#F5F0E8]">{formatCurrency(summary.bidAmount)}</span>
              </div>

              {mode === "accept_bid" ? (
                <>
                  <div className="flex justify-between text-xs text-[#8B7355]">
                    <span>Advance Deposit (70%)</span>
                    <span className="text-white font-medium">{formatCurrency(summary.advanceAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#8B7355]">
                    <span>Platform Service Charge (5%)</span>
                    <span className="text-white font-medium">{formatCurrency(summary.clientFee || 0)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-[#8B7355]">
                  <span>Milestone Final Release (30%)</span>
                  <span className="text-white font-medium">{formatCurrency(summary.remainingAmount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-[#C9A96E]/20">
                <span className="text-xs uppercase tracking-wider font-bold text-[#C9A96E]">Total Payable Now</span>
                <span className="text-2xl font-light text-white font-serif">{formatCurrency(summary.totalPayable)}</span>
              </div>
            </div>

            {/* Dummy Payment Gateway Box */}
            <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Dummy Payment Gateway</span>
              </div>
              <p className="text-[10px] text-[#8B7355] leading-relaxed">
                This gateway simulates a successful payment session. The architecture is ready to accept production APIs like Razorpay or Cashfree.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="w-1/2 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#8B7355] border border-[#C9A96E]/20 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={processing}
                className="w-1/2 py-3 rounded-full bg-[#C9A96E] hover:bg-[#B8944F] text-[#0D0D0D] text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0D0D0D]/20 border-t-[#0D0D0D] rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Securely"
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
