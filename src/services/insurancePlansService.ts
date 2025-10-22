import api from "./api";

export interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  premium_amount: number;
  premium_frequency: "daily" | "weekly" | "monthly" | "annual";
  coverage_amount: number;
  coverage_details: {
    benefits?: string[];
    limitations?: string[];
    terms?: string;
  };
  portions: {
    agent_commission: { type: "fixed" | "percent"; value: number };
    super_agent_commission: { type: "fixed" | "percent"; value: number };
    insurance_share: { type: "fixed" | "percent"; value: number };
    admin_share: { type: "fixed" | "percent"; value: number };
  };
  grace_period_days: number;
  is_active: boolean;
  subscriberCount?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanData {
  name: string;
  description?: string;
  premium_amount: number;
  premium_frequency: "daily" | "weekly" | "monthly" | "annual";
  coverage_amount: number;
  coverage_details?: {
    benefits?: string[];
    limitations?: string[];
    terms?: string;
  };
  portions: {
    agent_commission: { type: "fixed" | "percent"; value: number };
    super_agent_commission: { type: "fixed" | "percent"; value: number };
    insurance_share: { type: "fixed" | "percent"; value: number };
    admin_share: { type: "fixed" | "percent"; value: number };
  };
  grace_period_days?: number;
  is_active?: boolean;
}

/**
 * Fetch all insurance plans
 */
export const getPlans = async (
  activeOnly = false
): Promise<InsurancePlan[]> => {
  const response = await api.get("/plans", {
    params: { active_only: activeOnly },
  });
  return response.data.plans;
};

/**
 * Fetch single insurance plan by ID
 */
export const getPlanById = async (id: string): Promise<InsurancePlan> => {
  const response = await api.get(`/plans/${id}`);
  return response.data.plan;
};

/**
 * Create new insurance plan
 */
export const createPlan = async (
  data: CreatePlanData
): Promise<InsurancePlan> => {
  const response = await api.post("/plans", data);
  return response.data.plan;
};

/**
 * Update insurance plan
 */
export const updatePlan = async (
  id: string,
  data: Partial<CreatePlanData>
): Promise<InsurancePlan> => {
  const response = await api.put(`/plans/${id}`, data);
  return response.data.plan;
};

/**
 * Delete (deactivate) insurance plan
 */
export const deletePlan = async (id: string): Promise<void> => {
  await api.delete(`/plans/${id}`);
};

/**
 * Toggle plan active status
 */
export const togglePlanStatus = async (
  id: string,
  isActive: boolean
): Promise<InsurancePlan> => {
  const response = await api.patch(`/plans/${id}/status`, {
    is_active: isActive,
  });
  return response.data.plan;
};

export default {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
};
