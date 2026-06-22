import { apiFetch } from "@/lib/api";
import type { ApiResponse } from "@/types/auth.types";
import type { Notification } from "@/types/project.types";
import type { UserProfile, WalletData } from "@/types/user.types";

export const userService = {
  /** Get user profile with stats */
  async getUserProfile(userId: number): Promise<UserProfile> {
    const res = await apiFetch<ApiResponse<UserProfile>>(
      `/api/users/${userId}/profile`
    );
    return res.data!;
  },

  /** Update user profile information */
  async updateUserProfile(userId: number, data: Record<string, any>): Promise<void> {
    await apiFetch(`/api/users/${userId}/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Upload user profile photo */
  async uploadProfilePhoto(userId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("profile_photo", file);

    const res = await apiFetch<ApiResponse<{ profile_photo: string }>>(
      `/api/users/${userId}/profile/photo`,
      {
        method: "POST",
        body: formData,
      }
    );
    return res.data!.profile_photo;
  },

  /** Get user notifications */
  async getNotifications(): Promise<Notification[]> {
    const res = await apiFetch<ApiResponse<Notification[]>>(
      "/api/notifications"
    );
    return res.data!;
  },

  /** Mark notification as read */
  async markNotificationRead(notificationId: number): Promise<void> {
    await apiFetch(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },

  /** Get wallet data */
  async getWallet(userId: number): Promise<WalletData> {
    const res = await apiFetch<ApiResponse<WalletData>>(
      `/api/users/${userId}/wallet`
    );
    return res.data!;
  },

  /** Search users (professionals) */
  async searchUsers(
    query: string,
    role?: string
  ): Promise<{ users: import("@/types/auth.types").User[]; total: number }> {
    const params = new URLSearchParams({ q: query });
    if (role) params.set("role", role);

    const res = await apiFetch<
      ApiResponse<{
        users: import("@/types/auth.types").User[];
        total: number;
      }>
    >(`/api/search/users?${params}`);
    return res.data!;
  },

  /** Delete user account */
  async deleteAccount(userId: number): Promise<void> {
    await apiFetch(`/api/users/${userId}/profile`, {
      method: "DELETE",
    });
  },
};
