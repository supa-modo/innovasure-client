/**
 * Members Service
 * API integration for member management
 */

import api from "./api";

export interface Member {
  id: string;
  user_id?: string;
  agent_id: string;
  account_number: string;
  phone: string;
  full_name: string;
  id_number_encrypted?: string;
  kra_pin_encrypted?: string;
  date_of_birth?: string;
  gender?: string;
  address: string;
  next_of_kin: any;
  kyc_status: "pending" | "under_review" | "approved" | "rejected" | "flagged";
  kyc_documents?: any[];
  kyc_approved_at?: string;
  kyc_approved_by?: string;
  kyc_notes?: string;
  aml_flagged: boolean;
  created_at: string;
  updated_at: string;
  user?: any;
  agent?: any;
  subscription?: any;
  dependants?: any[];
}

export interface MemberFilters {
  page?: number;
  limit?: number;
  search?: string;
  kyc_status?: string;
  agent_id?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export interface CreateMemberData {
  phone: string;
  email?: string;
  full_name: string;
  id_number?: string;
  kra_pin?: string;
  date_of_birth?: string;
  gender?: string;
  address: string;
  next_of_kin: any;
  agent_id?: string;
}

/**
 * Get all members with filters and pagination
 */
export const getMembers = async (filters: MemberFilters = {}): Promise<any> => {
  const response = await api.get("/members", { params: filters });
  return response.data;
};

/**
 * Search members
 */
export const searchMembers = async (
  query: string,
  limit = 10
): Promise<Member[]> => {
  const response = await api.get("/members/search", {
    params: { q: query, limit },
  });
  return response.data.members;
};

/**
 * Get single member by ID
 */
export const getMemberById = async (id: string): Promise<Member> => {
  const response = await api.get(`/members/${id}`);
  return response.data.member;
};

/**
 * Create new member
 */
export const createMember = async (data: CreateMemberData): Promise<Member> => {
  const response = await api.post("/members", data);
  return response.data.member;
};

/**
 * Update member
 */
export const updateMember = async (
  id: string,
  data: Partial<Member>
): Promise<Member> => {
  const response = await api.put(`/members/${id}`, data);
  return response.data.member;
};

/**
 * Update member profile (self-service)
 */
export const updateMemberProfile = async (
  id: string,
  data: { phone?: string; address?: string; next_of_kin?: any }
): Promise<Member> => {
  const response = await api.put(`/members/${id}/profile`, data);
  return response.data.member;
};

/**
 * Update member KYC status
 */
export const updateKYCStatus = async (
  id: string,
  kyc_status: string,
  reason?: string
): Promise<Member> => {
  const response = await api.patch(`/members/${id}/kyc-status`, {
    kyc_status,
    reason,
  });
  return response.data.member;
};

/**
 * Upload KYC document
 */
export const uploadDocument = async (id: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("document", file);

  const response = await api.post(`/members/${id}/documents`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Get member documents with presigned URLs
 */
export const getDocuments = async (id: string): Promise<any[]> => {
  const response = await api.get(`/members/${id}/documents`);
  return response.data.documents;
};

/**
 * Delete KYC document
 */
export const deleteDocument = async (
  id: string,
  key: string
): Promise<void> => {
  await api.delete(`/members/${id}/documents/${encodeURIComponent(key)}`);
};

/**
 * Get members by agent
 */
export const getMembersByAgent = async (agentId: string): Promise<Member[]> => {
  const response = await api.get(`/members/agent/${agentId}`);
  return response.data.members;
};

/**
 * Export members to CSV (client-side generation)
 */
export const exportMembers = async (
  filters: MemberFilters = {}
): Promise<string> => {
  const data = await getMembers({ ...filters, limit: 10000 });
  const members: Member[] = data.members;

  // Generate CSV
  const headers = [
    "Account Number",
    "Full Name",
    "Phone",
    "KYC Status",
    "Registration Date",
  ];

  const rows = members.map((m) => [
    m.account_number,
    m.full_name,
    m.phone,
    m.kyc_status,
    new Date(m.created_at).toLocaleDateString(),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n"
  );

  return csv;
};

export default {
  getMembers,
  searchMembers,
  getMemberById,
  createMember,
  updateMember,
  updateMemberProfile,
  updateKYCStatus,
  uploadDocument,
  getDocuments,
  deleteDocument,
  getMembersByAgent,
  exportMembers,
};
