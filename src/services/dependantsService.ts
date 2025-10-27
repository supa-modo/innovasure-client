import api from "./api";

export interface Dependant {
  id: string;
  member_id: string;
  full_name: string;
  relationship: "spouse" | "child" | "parent" | "sibling" | "other";
  date_of_birth?: string;
  gender?: string;
  id_number: string;
  is_covered: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDependantRequest {
  member_id: string;
  full_name: string;
  relationship: "spouse" | "child" | "parent" | "sibling" | "other";
  date_of_birth?: string;
  gender?: string;
  id_number: string;
  is_covered?: boolean;
}

export interface UpdateDependantRequest {
  full_name?: string;
  relationship?: "spouse" | "child" | "parent" | "sibling" | "other";
  date_of_birth?: string;
  gender?: string;
  id_number?: string; // Optional in update to allow partial updates
  is_covered?: boolean;
}

export interface DependantsResponse {
  dependants: Dependant[];
  total: number;
}

/**
 * Get all dependants for a member
 */
export const getDependantsByMember = async (
  memberId: string
): Promise<DependantsResponse> => {
  const response = await api.get(`/dependants/member/${memberId}`);
  return response.data;
};

/**
 * Get single dependant by ID
 */
export const getDependantById = async (
  dependantId: string
): Promise<Dependant> => {
  const response = await api.get(`/dependants/${dependantId}`);
  return response.data.dependant;
};

/**
 * Create new dependant
 */
export const createDependant = async (
  data: CreateDependantRequest
): Promise<Dependant> => {
  const response = await api.post("/dependants", data);
  return response.data.dependant;
};

/**
 * Update dependant
 */
export const updateDependant = async (
  dependantId: string,
  data: UpdateDependantRequest
): Promise<Dependant> => {
  const response = await api.put(`/dependants/${dependantId}`, data);
  return response.data.dependant;
};

/**
 * Delete dependant
 */
export const deleteDependant = async (dependantId: string): Promise<void> => {
  await api.delete(`/dependants/${dependantId}`);
};

export default {
  getDependantsByMember,
  getDependantById,
  createDependant,
  updateDependant,
  deleteDependant,
};
