/**
 * Dashboard Service
 * API integration for agent and super-agent dashboards
 */

import api from "./api";

export interface PaymentStatus {
  status: "paid" | "due_today" | "overdue" | "upcoming";
}

export interface MemberWithStatus {
  id: string;
  full_name: string;
  account_number: string;
  phone: string;
  kyc_status: string;
  subscription: {
    id: string;
    next_due_date: string;
    last_payment_date?: string;
    status: string;
    plan: {
      id: string;
      name: string;
      premium_amount: number;
      premium_frequency: string;
    };
  } | null;
  paymentStatus: "paid" | "due_today" | "overdue" | "upcoming";
}

export interface CommissionEntry {
  id: string;
  amount: number;
  date: string;
  member_name: string;
  payment_amount: number;
}

export interface AgentDashboardData {
  stats: {
    totalMembers: number;
    activeSubscriptions: number;
    commissionBalance: number;
    todaysCommissions: number;
  };
  members: MemberWithStatus[];
  recentCommissions: CommissionEntry[];
  agentInfo: {
    code: string;
    name: string;
  };
}

export interface AgentPerformance {
  id: string;
  name: string;
  code: string;
  phone: string;
  memberCount: number;
  activeSubscriptions: number;
  commissionBalance: number;
  complianceRate: number;
}

export interface RecentActivity {
  type: string;
  agent_name: string;
  agent_code: string;
  details: string;
  timestamp: string;
}

export interface SuperAgentDashboardData {
  stats: {
    totalAgents: number;
    totalMembers: number;
    networkCommissionBalance: number;
    superAgentCommissionBalance: number;
    avgComplianceRate: number;
  };
  agents: AgentPerformance[];
  recentActivity: RecentActivity[];
  superAgentInfo: {
    code: string;
    name: string;
  };
}

export interface PaymentTrendData {
  date: string;
  count: number;
  revenue: number;
}

export interface SubscriptionByPlan {
  plan?: {
    id: string;
    name: string;
    premium_amount: number;
  };
  count: number;
}

export interface KYCStatusCount {
  kyc_status: string;
  count: number | string;
}

export interface RecentActivityItem {
  type: string;
  member_name?: string;
  agent_code?: string;
  amount?: number;
  account_number?: string;
  timestamp: string;
}

export interface AdminDashboardData {
  stats: {
    totalMembers: number;
    totalAgents: number;
    totalSuperAgents: number;
    activeSubscriptions: number;
    pendingKYC: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingCommissions: number;
    disbursedCommissions: number;
  };
  paymentTrends: PaymentTrendData[];
  subscriptionsByPlan: SubscriptionByPlan[];
  kycStatusDistribution: KYCStatusCount[];
  topAgents: AgentPerformance[];
  recentActivity: RecentActivityItem[];
}

/**
 * Get agent dashboard data
 */
export const getAgentDashboard = async (): Promise<AgentDashboardData> => {
  const response = await api.get("/dashboard/agent");
  return response.data;
};

/**
 * Get super agent dashboard data
 */
export const getSuperAgentDashboard =
  async (): Promise<SuperAgentDashboardData> => {
    const response = await api.get("/dashboard/super-agent");
    return response.data;
  };

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async (
  period?: number
): Promise<AdminDashboardData> => {
  const params = period ? { period } : {};
  const response = await api.get("/dashboard/admin", { params });
  return response.data;
};

export default {
  getAgentDashboard,
  getSuperAgentDashboard,
  getAdminDashboard,
};
