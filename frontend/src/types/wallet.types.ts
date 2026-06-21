export interface WalletTransaction {
  id: number
  amount: number
  payment_method: string
  transaction_type: string
  status: string
  user_id: number | null
  project_id: number | null
  created_at: string
  description: string
}

export interface BankAccountData {
  id: number
  account_holder_name: string
  bank_name: string
  account_number: string
  ifsc_code: string
  is_active: boolean
}

export interface WalletData {
  balance: number
  escrow_balance: number
  total_incoming: number
  lifetime_earnings: number
  pending_withdrawals: number
  bank_accounts: BankAccountData[]
  currency: string
  transactions: WalletTransaction[]
  lifetime_spend?: number
  stats: {
    total_transactions: number
    completed_transactions: number
    pending_transactions: number
  }
}
