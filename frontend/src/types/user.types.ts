export interface UserProfile {
  user: import("./auth.types").User;
  stats: {
    projects_posted: number;
    professionals_hired: number;
    completed_projects: number;
    projects_completed: number;
    total_projects: number;
    bids_submitted: number;
    reviews_received: number;
    average_rating: number;
    experience_years: number;
  };
  wallet_balance: number;
  verification_documents: VerificationDocument[];
  profile_details: Record<string, any>;
  portfolio: Array<{
    id: number;
    image: string;
    title: string;
    description: string;
  }>;
  saved_professionals: Array<{
    id: number;
    full_name: string;
    role: string;
    rating: number;
    profile_photo: string | null;
  }>;
  active_projects: Array<{
    id: number;
    title: string;
    assigned_professional_name: string;
    status: string;
    completion_date: string;
  }>;
  recent_projects: import("./project.types").Project[];
  recent_bids: import("./project.types").Bid[];
}

export interface VerificationDocument {
  id: number;
  user_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  status: "under_review" | "verified" | "rejected";
  uploaded_at: string;
}

export interface WalletData {
  balance: number;
  currency: string;
  transactions: Transaction[];
  stats: {
    total_transactions: number;
    completed_transactions: number;
    pending_transactions: number;
  };
}

export interface Transaction {
  id: number;
  client_id: number;
  designer_id: number;
  project_id: number | null;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}
