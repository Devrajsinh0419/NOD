import { apiFetch } from "@/lib/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ApiResponse,
  ResetPasswordRequest,
} from "@/types/auth.types";

const TOKEN_KEY = "nod_token";
const USER_KEY = "nod_user";

export const authService = {
  /** Login with email + password */
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const res = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: data.email,
        password: data.password,
      }),
    });

    if (!res.data) throw new Error("No data in response");

    // Persist
    localStorage.setItem(TOKEN_KEY, res.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));

    return res.data;
  },

  /** Login with Google Firebase ID token */
  async loginWithGoogle(idToken: string, role: string): Promise<{ user: User; token: string }> {
    const res = await apiFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken, role }),
    });

    if (!res.data) throw new Error("No data in response");

    // Persist
    localStorage.setItem(TOKEN_KEY, res.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));

    return res.data;
  },

  /** Register a new account */
  async register(
    data: RegisterRequest
  ): Promise<{ user: User; token: string }> {
    const res = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!res.data) throw new Error("No data in response");

    localStorage.setItem(TOKEN_KEY, res.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user))

    return res.data;
  },

  /** Logout */
  async logout(): Promise<void> {
    try {
      await apiFetch<ApiResponse>("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore — clear local state regardless
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** Get current user from API */
  async getMe(): Promise<User> {
    const res = await apiFetch<ApiResponse<User>>("/api/auth/me");
    if (!res.data) throw new Error("No user data");
    return res.data;
  },

  /** Get stored token */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /** Get stored user (from localStorage, no API call) */
  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  /** Check if user is authenticated */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /** Send a forgot password request */
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>("/api/auth/forgot-password/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /** Reset password with a token */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
    return await apiFetch<ApiResponse<null>>("/api/auth/reset-password/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Send OTP to email/phone */
  async sendOtp(email: string, phoneNumber: string, purpose: string = "signup"): Promise<ApiResponse<any>> {
    return await apiFetch<ApiResponse<any>>("/api/accounts/send-otp/", {
      method: "POST",
      body: JSON.stringify({ email, phone_number: phoneNumber, purpose }),
    });
  },

  /** Verify OTP */
  async verifyOtp(phoneNumber: string, otpCode: string, purpose: string = "signup"): Promise<ApiResponse<any>> {
    return await apiFetch<ApiResponse<any>>("/api/accounts/verify-otp/", {
      method: "POST",
      body: JSON.stringify({ phone_number: phoneNumber, otp_code: otpCode, purpose }),
    });
  },
};
