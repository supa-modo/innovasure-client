/**
 * Super Agents Service
 * API integration for super-agent management
 */

import api from "./api";

export interface SuperAgent {
  id: string;
  user_id: string;
  code: string;
  id_number_encrypted?: string;
  kra_pin_encrypted?: string;
  kyc_status: "pending" | "under_review" | "approved" | "rejected" | "flagged";
  kyc_documents?: any[];
  kyc_approved_at?: string;
  kyc_approved_by?: string;
  kyc_notes?: string;
  created_at: string;
  updated_at: string;
  user?: any;
  agentCount?: number;
  memberCount?: number;
  commissionBalance?: number;
}

export interface SuperAgentFilters {
  page?: number;
  limit?: number;
  search?: string;
  kyc_status?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface CreateSuperAgentData {
  phone: string;
  email?: string;
  password: string;
  full_name: string;
  id_number?: string;
  kra_pin?: string;
}

export interface SuperAgentStats {
  agentCount: number;
  memberCount: number;
  commissionBalance: number;
  totalCommissions: number;
}

/**
 * Get all super-agents with filters and pagination
 */
export const getSuperAgents = async (
  filters: SuperAgentFilters = {}
): Promise<any> => {
  const response = await api.get("/super-agents", { params: filters });
  return response.data;
};

/**
 * Search super-agents
 */
export const searchSuperAgents = async (
  query: string,
  limit = 10
): Promise<SuperAgent[]> => {
  const response = await api.get("/super-agents/search", {
    params: { q: query, limit },
  });
  return response.data.superAgents;
};

/**
 * Get single super-agent by ID
 */
export const getSuperAgentById = async (id: string): Promise<SuperAgent> => {
  const response = await api.get(`/super-agents/${id}`);
  return response.data.superAgent;
};

/**
 * Create new super-agent
 */
export const createSuperAgent = async (
  data: CreateSuperAgentData
): Promise<SuperAgent> => {
  const response = await api.post("/super-agents", data);
  return response.data.superAgent;
};

/**
 * Update super-agent
 */
export const updateSuperAgent = async (
  id: string,
  data: Partial<SuperAgent>
): Promise<SuperAgent> => {
  const response = await api.put(`/super-agents/${id}`, data);
  return response.data.superAgent;
};

/**
 * Update super-agent KYC status
 */
export const updateSuperAgentKYC = async (
  id: string,
  kyc_status: string,
  reason?: string
): Promise<SuperAgent> => {
  const response = await api.patch(`/super-agents/${id}/kyc`, {
    kyc_status,
    reason,
  });
  return response.data.superAgent;
};

/**
 * Toggle super-agent status (active/inactive)
 */
export const toggleSuperAgentStatus = async (
  id: string,
  status: "active" | "inactive"
): Promise<SuperAgent> => {
  const response = await api.patch(`/super-agents/${id}/status`, { status });
  return response.data.superAgent;
};

/**
 * Reset super-agent password
 */
export const resetSuperAgentPassword = async (
  id: string,
  new_password: string
): Promise<void> => {
  await api.post(`/super-agents/${id}/reset-password`, { new_password });
};

/**
 * Get super-agent network statistics
 */
export const getSuperAgentStats = async (
  id: string
): Promise<SuperAgentStats> => {
  const response = await api.get(`/super-agents/${id}/stats`);
  return response.data.stats;
};

/**
 * Get super-agent commission history
 */
export const getSuperAgentCommissionHistory = async (
  id: string,
  limit = 50
): Promise<any> => {
  const response = await api.get(`/super-agents/${id}/commissions`, {
    params: { limit },
  });
  return response.data;
};

/**
 * Get agents by super-agent
 */
export const getAgentsBySuperAgent = async (
  superAgentId: string
): Promise<any> => {
  const response = await api.get(`/agents/super/${superAgentId}`);
  return response.data.agents;
};

export default {
  getSuperAgents,
  searchSuperAgents,
  getSuperAgentById,
  createSuperAgent,
  updateSuperAgent,
  updateSuperAgentKYC,
  toggleSuperAgentStatus,
  resetSuperAgentPassword,
  getSuperAgentStats,
  getSuperAgentCommissionHistory,
  getAgentsBySuperAgent,
};
