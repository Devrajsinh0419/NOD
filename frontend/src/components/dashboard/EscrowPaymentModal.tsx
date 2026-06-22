"use client"

import { useEffect, useState } from "react"
import { projectService } from "@/services/project.service"
import { formatToUserCurrency } from "@/utils/currency"

interface EscrowPaymentModalProps {
  isOpen: boolean
  mode: "accept_bid" | "complete_project"
  targetId: number // bidId for accept_bid, projectId for complete_project
  onClose: () => void
  onSuccess: (data: any) => void
}

const StarIcon = ({
  filled,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  filled: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="focus:outline-none"
  >
    <svg
      className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
        filled ? "text-[#C9A96E]" : "text-zinc-600 hover:text-[#C9A96E]/50"
      }`}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.773-.56-.375-1.81.587-1.81H8.47a1 1 0 00.95-.69l1.519-4.674z"
      />
    </svg>
  </button>
)

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
    currency: string
  } | null>(null)

  // Review & Rating State
  const [showReview, setShowReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [projectCompletionData, setProjectCompletionData] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      loadPaymentSummary()
      setShowReview(false)
      setRating(5)
      setReviewText("")
      setProjectCompletionData(null)
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
          currency: res.currency,
        })
      } else {
        const res = await projectService.getProjectPaymentSummary(targetId)
        setSummary({
          bidAmount: res.bid_amount,
          remainingAmount: res.remaining_amount,
          totalPayable: res.total_payable,
          currency: res.currency,
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
          setProjectCompletionData(res)
          setShowReview(true)
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

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true)
      setError("")
      const res = await projectService.submitProjectReview(targetId, {
        rating,
        review_text: reviewText,
      })
      if (res.success) {
        alert("Thank you! Your review has been submitted successfully.")
        onSuccess(projectCompletionData)
      } else {
        throw new Error(res.message || "Failed to submit review")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review submission failed")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (!isOpen) return null

  const formatCurrency = (val: number) => {
    const origCurrency = summary?.currency || "USD"
    return formatToUserCurrency(val, origCurrency)
  }

  if (showReview) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-[#C9A96E]/30 bg-[#111111] p-6 space-y-6 shadow-2xl animate-scaleUp text-[#F5F0E8]">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-light font-serif text-[#C9A96E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Review the Professional
            </h3>
            <p className="text-[10px] text-[#8B7355] tracking-wider uppercase font-semibold">
              Share your experience with other clients
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <span className="text-xs text-[#8B7355]">Select Rating</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={hoverRating !== null ? star <= hoverRating : star <= rating}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-[#C9A96E]">
                {rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
              </span>
            </div>

            <div className="space-y-1">
              <label htmlFor="review_comments" className="text-[10px] uppercase tracking-wider text-[#8B7355] font-bold">Comments</label>
              <textarea
                id="review_comments"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here... How was the communication, quality of work, and timeliness?"
                rows={4}
                className="w-full rounded-2xl border border-[#C9A96E]/20 bg-[#1A1714] p-3 text-xs text-[#F5F0E8] focus:border-[#C9A96E] focus:outline-none transition-colors placeholder:text-[#8B7355]/50 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onSuccess(projectCompletionData)
                }}
                disabled={submittingReview}
                className="w-1/2 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#8B7355] border border-[#C9A96E]/20 hover:text-white transition-colors"
              >
                Skip Review
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="w-1/2 py-3 rounded-full bg-[#C9A96E] hover:bg-[#B8944F] text-[#0D0D0D] text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0D0D0D]/20 border-t-[#0D0D0D] rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
