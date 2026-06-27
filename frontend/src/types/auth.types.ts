export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "client" | "designer" | "architect" | "contractor" | "admin";
  designer_specialization: string | null;
  verification_status: "pending" | "verified" | "rejected" | "banned";
  email_verified: boolean;
  phone_number: string;
  currency: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  profile_completion_percentage: number;
  profile_photo: string | null;
  bio: string | null;
  address: string | null;
  website: string | null;
  social_links: Record<string, string>;
  skills: string[];
  rating: number;
  total_reviews: number;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone_number: string;
  role?: string;
  [key: string]: any;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

