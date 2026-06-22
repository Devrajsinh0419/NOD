import { apiFetch } from "@/lib/api";
import type { ApiResponse } from "@/types/auth.types";
import type {
  Project,
  ProjectCreateData,
  ProjectUpdateData,
  ClientDashboardData,
} from "@/types/project.types";

export const projectService = {
  /** Get all projects with optional filters */
  async getProjects(filters?: {
    client_id?: number;
    status?: string;
    category?: string;
    page?: number;
    search?: string;
  }): Promise<{ projects: Project[]; pagination: Record<string, number> }> {
    const params = new URLSearchParams();
    if (filters?.client_id) params.set("client_id", String(filters.client_id));
    if (filters?.status) params.set("status", filters.status);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.search) params.set("search", filters.search);

    const qs = params.toString();
    const res = await apiFetch<
      ApiResponse<{ projects: Project[]; pagination: Record<string, number> }>
    >(`/api/projects${qs ? `?${qs}` : ""}`);

    return res.data!;
  },

  /** Get single project */
  async getProject(id: number): Promise<Project> {
    const res = await apiFetch<ApiResponse<{ project: Project }>>(
      `/api/projects/${id}`
    );
    return res.data!.project;
  },

  /** Create a new project (draft) */
  async createProject(data: ProjectCreateData): Promise<Project> {
    const res = await apiFetch<ApiResponse<{ project: Project }>>(
      "/api/projects",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data!.project;
  },

  /** Update an existing project */
  async updateProject(id: number, data: ProjectUpdateData): Promise<Project> {
    const res = await apiFetch<ApiResponse<{ project: Project }>>(
      `/api/projects/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return res.data!.project;
  },

  /** Publish a project (changes status to "published") */
  async publishProject(id: number): Promise<Project> {
    const res = await apiFetch<ApiResponse<{ project: Project }>>(
      `/api/projects/${id}/publish`,
      { method: "POST" }
    );
    return res.data!.project;
  },

  /** Get client's own projects */
  async getClientProjects(clientId: number): Promise<Project[]> {
    const res = await this.getProjects({ client_id: clientId });
    return res.projects;
  },

  /** Get published projects for marketplace */
  async getMarketplaceProjects(): Promise<Project[]> {
    const res = await apiFetch<ApiResponse<{ projects: Project[] }>>(
      "/api/marketplace/projects"
    );
    return res.data!.projects;
  },

  /** Submit a bid for a project */
  async submitBid(
    projectId: number,
    data: { amount: number; duration: string; proposal: string }
  ): Promise<any> {
    const res = await apiFetch<ApiResponse<{ bid: any }>>(
      `/api/projects/${projectId}/bids`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data!.bid;
  },

  async acceptBid(bidId: number): Promise<any> {
    const res = await apiFetch<ApiResponse<{ bid: any; project: Project }>>(
      `/api/bids/${bidId}/accept`,
      {
        method: "POST",
      }
    );
    return res;
  },

  /** Get bids for a project */
  async getProjectBids(projectId: number): Promise<any[]> {
    const res = await apiFetch<ApiResponse<{ bids: any[] }>>(
      `/api/projects/${projectId}/bids`
    );
    return res.data!.bids;
  },

  /** Get client dashboard aggregated data */
  async getClientDashboard(userId: number): Promise<ClientDashboardData> {
    const res = await apiFetch<ApiResponse<ClientDashboardData>>(
      `/api/client/dashboard?user_id=${userId}`
    );
    return res.data!;
  },

  /** Get professional dashboard aggregated data */
  async getProfessionalDashboard(userId: number): Promise<ClientDashboardData> {
    const res = await apiFetch<ApiResponse<ClientDashboardData>>(
      `/api/professional/dashboard?user_id=${userId}`
    );
    return res.data!;
  },

  /** Get professional projects (working & bidded) */
  async getProfessionalProjects(userId: number): Promise<{ working_projects: Project[]; bidded_projects: Array<{ project: Project; bid: any }> }> {
    const res = await apiFetch<ApiResponse<{ working_projects: Project[]; bidded_projects: Array<{ project: Project; bid: any }> }>>(
      `/api/professional/projects?user_id=${userId}`
    );
    return res.data!;
  },

  /** Delete a project */
  async deleteProject(id: number): Promise<void> {
    await apiFetch<ApiResponse<any>>(`/api/projects/${id}`, {
      method: "DELETE",
    });
  },

  /** Escrow payment system helper: get bid payment summary */
  async getBidPaymentSummary(bidId: number): Promise<{ bid_id: number; bid_amount: number; advance_amount: number; client_fee: number; total_payable: number; currency: string }> {
    const res = await apiFetch<ApiResponse<{ bid_id: number; bid_amount: number; advance_amount: number; client_fee: number; total_payable: number; currency: string }>>(
      `/api/bids/${bidId}/payment-summary`
    );
    return res.data!;
  },

  /** Escrow payment system helper: get project payment summary */
  async getProjectPaymentSummary(projectId: number): Promise<{ project_id: number; bid_amount: number; remaining_amount: number; total_payable: number; currency: string }> {
    const res = await apiFetch<ApiResponse<{ project_id: number; bid_amount: number; remaining_amount: number; total_payable: number; currency: string }>>(
      `/api/projects/${projectId}/payment-summary`
    );
    return res.data!;
  },

  /** Escrow payment system helper: request project completion */
  async requestProjectCompletion(projectId: number): Promise<any> {
    const res = await apiFetch<ApiResponse<any>>(
      `/api/projects/${projectId}/request-completion`,
      { method: "POST" }
    );
    return res;
  },

  /** Escrow payment system helper: approve project completion and pay remaining 30% */
  async approveProjectCompletion(projectId: number): Promise<any> {
    const res = await apiFetch<ApiResponse<any>>(
      `/api/projects/${projectId}/approve-completion`,
      { method: "POST" }
    );
    return res;
  },

  /** Submit a project review */
  async submitProjectReview(projectId: number, data: { rating: number; review_text?: string }): Promise<any> {
    const res = await apiFetch<ApiResponse<any>>(
      `/api/projects/${projectId}/submit-review`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res;
  },
};

export default projectService;
