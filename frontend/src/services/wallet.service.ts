import { apiFetch } from "@/lib/api"
import type { ApiResponse } from "@/types/auth.types"
import type { WalletData, WalletTransaction, BankAccountData } from "@/types/wallet.types"

export const walletService = {
  /** Get user wallet statistics & transactions list */
  async getWallet(userId: number): Promise<WalletData> {
    const res = await apiFetch<ApiResponse<WalletData>>(`/api/users/${userId}/wallet`)
    return res.data!
  },

  /** Deposit funds to wallet (deprecated for clients, kept for schema completeness) */
  async deposit(userId: number, amount: number, paymentMethod = "razorpay"): Promise<{ balance: number; transaction: WalletTransaction }> {
    const res = await apiFetch<ApiResponse<{ balance: number; transaction: WalletTransaction }>>(
      `/api/users/${userId}/wallet/deposit`,
      {
        method: "POST",
        body: JSON.stringify({ amount, payment_method: paymentMethod }),
      }
    )
    return res.data!
  },

  /** Withdraw funds from wallet */
  async withdraw(userId: number, amount: number): Promise<{ balance: number; transaction: WalletTransaction }> {
    const res = await apiFetch<ApiResponse<{ balance: number; transaction: WalletTransaction }>>(
      `/api/users/${userId}/wallet/withdraw`,
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      }
    )
    return res.data!
  },

  /** Link a bank account for withdrawals */
  async linkBankAccount(
    userId: number,
    data: { account_holder_name: string; bank_name: string; account_number: string; ifsc_code: string }
  ): Promise<BankAccountData> {
    const res = await apiFetch<ApiResponse<BankAccountData>>(`/api/users/${userId}/bank-accounts`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return res.data!
  },

  /** Get linked bank accounts */
  async getBankAccounts(userId: number): Promise<BankAccountData[]> {
    const res = await apiFetch<ApiResponse<BankAccountData[]>>(`/api/users/${userId}/bank-accounts`)
    return res.data!
  },
}
export default walletService
