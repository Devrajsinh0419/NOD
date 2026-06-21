export interface Tender {
  id: string;
  bidNumber: string;
  title: string;
  ministry: string;
  department: string;
  startDate: string;
  endDate: string;
  source: string;
}

export interface TenderStats {
  totalTenders: number;
  relevantTenders: number;
  ministriesCount: number;
  departmentsCount: number;
}

export interface TenderApiResponse {
  success: boolean;
  data: Tender[];
  total: number;
  page: number;
  limit: number;
}
