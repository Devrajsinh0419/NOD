export interface Tender {
  id: string;
  bidNumber: string;
  title: string;
  ministry: string;
  department: string;
  startDate: string;
  endDate: string;
  source: string;
  state: string;
  city: string;
  category: string;
  estimatedValue: string;
  tenderUrl: string;
  documentUrls: string[];
  status: string;
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
