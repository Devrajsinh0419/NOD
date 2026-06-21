"use client"

import { useEffect, useState } from "react"
import { authService } from "@/services/auth.service"
import { walletService } from "@/services/wallet.service"
import type { WalletData } from "@/types/wallet.types"

export default function ClientWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError("")
        const user = authService.getStoredUser() || await authService.getMe()
        if (user && user.id) {
          const data = await walletService.getWallet(user.id)
          setWallet(data)
        } else {
          setError("Failed to resolve user profile.")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payment history.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getTransactionBadge = (type: string, status: string) => {
    const isCompleted = status.toLowerCase() === "completed"
    if (!isCompleted) {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    }
    if (type.includes("fee") || type.includes("FEE")) {
      return "bg-gray-500/10 text-gray-400 border border-gray-500/20"
    }
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-2 border-[#C9A96E]/20 border-t-[#C9A96E] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <div className="inline-flex w-16 h-16 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 items-center justify-center text-2xl">⚠️</div>
        <h3 className="text-xl font-serif text-[#F5F0E8]">Failed to Load Payment Details</h3>
        <p className="text-xs text-[#8B7355]">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 text-[#F5F0E8] animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C9A96E]/20 pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-light tracking-wide font-serif text-black" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Payment History & Spending
          </h2>
          <p className="text-xs text-[#8B7355] font-light">
            Monitor your milestones, platform payments, and complete escrow transaction log.
          </p>
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A96E]/2 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] text-[#8B7355] uppercase tracking-wider mb-2">Lifetime Spent</p>
          <h3 className="text-4xl font-serif font-light text-[#C9A96E]">
            ₹{(wallet?.lifetime_spend || 0).toLocaleString()}
          </h3>
          <p className="text-[10px] text-[#6B5A42] mt-1.5">Includes platform service fees</p>
        </div>

        <div className="rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/2 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] text-[#8B7355] uppercase tracking-wider mb-2">Active Escrow Balance</p>
          <h3 className="text-4xl font-serif font-light text-black">
            ₹{(wallet?.escrow_balance || 0).toLocaleString()}
          </h3>
          <p className="text-[10px] text-[#6B5A42] mt-1.5">Locked until milestone completion approval</p>
        </div>

        <div className="rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/2 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] text-[#8B7355] uppercase tracking-wider mb-2">Total Transactions</p>
          <h3 className="text-4xl font-serif font-light text-[#B8A88A]">
            {wallet?.stats?.total_transactions || 0}
          </h3>
          <p className="text-[10px] text-[#6B5A42] mt-1.5">Total platform actions recorded</p>
        </div>
      </div>

      {/* Transaction Logs */}
      <div className="rounded-3xl border border-[#C9A96E]/12 bg-[#1A1714] p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-serif text-[#F5F0E8]">Transaction Log</h3>
          <span className="text-[10px] uppercase tracking-wider text-[#8B7355] bg-white/2 border border-[#C9A96E]/12 px-2.5 py-1 rounded-full">
            Real-time Sync
          </span>
        </div>

        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <span className="text-3xl text-white/5">🧾</span>
            <p className="text-xs text-[#8B7355]">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#C9A96E]/12 text-[#8B7355] text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9A96E]/6">
                {wallet.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/1 transition-colors">
                    <td className="py-4 px-4 font-mono text-[10px] text-[#8B7355]">
                      #{tx.id}
                    </td>
                    <td className="py-4 px-4 text-[#8B7355]">
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 text-[#B8A88A] max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] capitalize text-[#B8A88A]">
                        {tx.transaction_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${getTransactionBadge(tx.transaction_type, tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-black font-semibold">
                      ₹{Number(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
