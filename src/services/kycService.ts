/**
 * KYC Service
 * API integration for KYC management
 */

import api from "./api";

export interface KYCQueueItem {
  id: string;
  entityType: "member" | "agent" | "super_agent";
  full_name?: string;
  phone?: string;
  kyc_status: string;
  kyc_documents?: any[];
  created_at: string;
  user?: any;
  [key: string]: any;
}

export interface KYCFilters {
  type?: "member" | "agent" | "super_agent" | "all";
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Get KYC queue (pending applications)
 */
export const getKYCQueue = async (filters: KYCFilters = {}): Promise<any> => {
  const response = await api.get("/kyc/queue", { params: filters });
  return response.data;
};

/**
 * Get KYC details by type and ID
 */
export const getKYCById = async (
  type: "member" | "agent" | "super_agent",
  id: string
): Promise<any> => {
  const response = await api.get(`/kyc/${type}/${id}`);
  return response.data.entity;
};

/**
 * Approve KYC application
 */
export const approveKYC = async (
  type: "member" | "agent" | "super_agent",
  id: string,
  notes?: string
): Promise<any> => {
  const response = await api.post(`/kyc/${type}/${id}/approve`, { notes });
  return response.data;
};

/**
 * Reject KYC application
 */
export const rejectKYC = async (
  type: "member" | "agent" | "super_agent",
  id: string,
  reason: string,
  notes?: string
): Promise<any> => {
  const response = await api.post(`/kyc/${type}/${id}/reject`, {
    reason,
    notes,
  });
  return response.data;
};

/**
 * Flag KYC application for review
 */
export const flagKYC = async (
  type: "member" | "agent" | "super_agent",
  id: string,
  reason: string,
  notes?: string
): Promise<any> => {
  const response = await api.post(`/kyc/${type}/${id}/flag`, { reason, notes });
  return response.data;
};

/**
 * Get KYC action history
 */
export const getKYCHistory = async (
  filters: { type?: string; limit?: number } = {}
): Promise<any> => {
  const response = await api.get("/kyc/history", { params: filters });
  return response.data;
};

export default {
  getKYCQueue,
  getKYCById,
  approveKYC,
  rejectKYC,
  flagKYC,
  getKYCHistory,
};
