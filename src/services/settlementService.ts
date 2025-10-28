import api from "./api";

export interface SettlementBatch {
  id: string;
  settlement_date: string;
  totals: {
    total_payments: number;
    total_insurance: number;
    total_admin: number;
    total_agent_commissions: number;
    total_super_agent_commissions: number;
    payment_count: number;
  };
  payout_status?: {
    insurance?: "pending" | "completed" | "failed" | "manual" | "in_progress";
    administrative?:
      | "pending"
      | "completed"
      | "failed"
      | "manual"
      | "in_progress";
    commissions?:
      | "pending"
      | "completed"
      | "failed"
      | "partially_failed"
      | "in_progress";
  };
  completion_percentage: number;
  status: "open" | "processed" | "reconciliation" | "completed";
  generated_by: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutDetail {
  id: string;
  beneficiary_id: string;
  beneficiary_type: "agent" | "super_agent";
  beneficiary_name: string;
  beneficiary_phone: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "reconciliation";
  provider: "mpesa" | "bank" | "manual";
  conversation_id?: string;
  provider_txn_id?: string;
  attempts: number;
  last_attempt_at?: string;
  error_details: Record<string, any>;
  manual_transaction_ref?: string;
  manual_transaction_details?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PayoutStatusResponse {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  payout_status: SettlementBatch["payout_status"];
  completion_percentage: number;
}

export interface PayoutDetailsResponse {
  payouts: PayoutDetail[];
  total: number;
}

export interface ManualPayoutRequest {
  transactionRef: string;
  transactionDate: string;
  phone: string;
  notes?: string;
}

/**
 * Initiate commission payouts for a settlement batch
 */
export const initiateCommissionPayouts = async (
  settlementId: string
): Promise<any> => {
  const response = await api.post(
    `/settlements/${settlementId}/payouts/commissions`
  );
  return response.data;
};

/**
 * Get real-time payout status for a settlement batch
 */
export const getPayoutStatus = async (
  settlementId: string
): Promise<PayoutStatusResponse> => {
  const response = await api.get(`/settlements/${settlementId}/payout-status`);
  return response.data.data;
};

/**
 * Get detailed payout list with beneficiary information
 */
export const getPayoutDetails = async (
  settlementId: string,
  status?: "pending" | "completed" | "failed"
): Promise<PayoutDetailsResponse> => {
  const params = status ? { status } : {};
  const response = await api.get(
    `/settlements/${settlementId}/payouts/details`,
    {
      params,
    }
  );
  return response.data.data;
};

/**
 * Retry a failed payout
 */
export const retryPayout = async (
  settlementId: string,
  payoutId: string
): Promise<any> => {
  const response = await api.post(
    `/settlements/${settlementId}/payouts/${payoutId}/retry`
  );
  return response.data;
};

/**
 * Record manual payout for a failed commission payout
 */
export const recordManualPayout = async (
  settlementId: string,
  payoutId: string,
  details: ManualPayoutRequest
): Promise<any> => {
  const response = await api.post(
    `/settlements/${settlementId}/payouts/${payoutId}/manual`,
    details
  );
  return response.data;
};

/**
 * Get all settlement batches
 */
export const getSettlementBatches = async (params?: {
  status?: "open" | "processed";
  limit?: number;
  offset?: number;
}): Promise<{ batches: SettlementBatch[]; total: number }> => {
  const response = await api.get("/settlements", { params });
  return response.data.data;
};

/**
 * Get settlement batch details
 */
export const getSettlementDetails = async (
  settlementId: string
): Promise<SettlementBatch> => {
  const response = await api.get(`/settlements/${settlementId}`);
  return response.data.data.batch;
};

/**
 * Generate a new settlement batch
 */
export const generateSettlement = async (date: string): Promise<any> => {
  const response = await api.post("/settlements/generate", { date });
  return response.data;
};

/**
 * Get commission breakdown for a settlement batch
 */
export const getCommissionBreakdown = async (
  settlementId: string
): Promise<any> => {
  const response = await api.get(
    `/settlements/${settlementId}/commission-breakdown`
  );
  return response.data;
};

// Default export for convenience
const settlementService = {
  initiateCommissionPayouts,
  getPayoutStatus,
  getPayoutDetails,
  retryPayout,
  recordManualPayout,
  getSettlementBatches,
  getSettlementDetails,
  generateSettlement,
  getCommissionBreakdown,
};

export default settlementService;
