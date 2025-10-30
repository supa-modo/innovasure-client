/**
 * Agents Service
 * API integration for agent management
 */

import api from "./api";

export interface Agent {
  id: string;
  user_id: string;
  super_agent_id?: string;
  code: string;
  full_name: string;
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
  super_agent?: any;
  memberCount?: number;
  commissionBalance?: number;
}

export interface AgentFilters {
  page?: number;
  limit?: number;
  search?: string;
  kyc_status?: string;
  super_agent_id?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface CreateAgentData {
  phone: string;
  email?: string;
  password: string;
  full_name: string;
  id_number?: string;
  kra_pin?: string;
  super_agent_id?: string;
}

export interface AgentStats {
  memberCount: number;
  activeSubscriptions: number;
  commissionBalance: number;
  totalCommissions: number;
}

/**
 * Get all agents with filters and pagination
 */
export const getAgents = async (filters: AgentFilters = {}): Promise<any> => {
  const response = await api.get("/agents", { params: filters });
  return response.data;
};

/**
 * Search agents
 */
export const searchAgents = async (
  query: string,
  limit = 10
): Promise<Agent[]> => {
  const response = await api.get("/agents/search", {
    params: { q: query, limit },
  });
  return response.data.agents;
};

/**
 * Get single agent by ID
 */
export const getAgentById = async (id: string): Promise<Agent> => {
  const response = await api.get(`/agents/${id}`);
  return response.data.agent;
};

/**
 * Create new agent
 */
export const createAgent = async (data: CreateAgentData): Promise<Agent> => {
  const response = await api.post("/agents", data);
  return response.data.agent;
};

/**
 * Update agent
 */
export const updateAgent = async (
  id: string,
  data: Partial<Agent>
): Promise<Agent> => {
  const response = await api.put(`/agents/${id}`, data);
  return response.data.agent;
};

/**
 * Update agent KYC status
 */
export const updateAgentKYC = async (
  id: string,
  kyc_status: string,
  reason?: string
): Promise<Agent> => {
  const response = await api.patch(`/agents/${id}/kyc`, {
    kyc_status,
    reason,
  });
  return response.data.agent;
};

/**
 * Toggle agent status (active/inactive)
 */
export const toggleAgentStatus = async (
  id: string,
  status: "active" | "inactive"
): Promise<Agent> => {
  const response = await api.patch(`/agents/${id}/status`, { status });
  return response.data.agent;
};

/**
 * Reset agent password
 */
export const resetAgentPassword = async (
  id: string,
  new_password: string
): Promise<void> => {
  await api.post(`/agents/${id}/reset-password`, { new_password });
};

/**
 * Get agent statistics
 */
export const getAgentStats = async (id: string): Promise<AgentStats> => {
  const response = await api.get(`/agents/${id}/stats`);
  return response.data.stats;
};

/**
 * Get agents by super-agent
 */
export const getAgentsBySuper = async (
  superAgentId: string
): Promise<Agent[]> => {
  const response = await api.get(`/agents/super/${superAgentId}`);
  return response.data.agents;
};

/**
 * Verify agent code (public endpoint)
 */
export const verifyAgentCode = async (code: string): Promise<any> => {
  const response = await api.get(`/agents/verify/${code}`);
  return response.data;
};

/**
 * Get agent commission history
 */
export const getAgentCommissionHistory = async (
  id: string,
  limit = 50
): Promise<any> => {
  const response = await api.get(`/agents/${id}/commissions`, {
    params: { limit },
  });
  return response.data;
};

export default {
  getAgents,
  searchAgents,
  getAgentById,
  createAgent,
  updateAgent,
  updateAgentKYC,
  toggleAgentStatus,
  resetAgentPassword,
  getAgentStats,
  getAgentsBySuper,
  verifyAgentCode,
  getAgentCommissionHistory,
};
