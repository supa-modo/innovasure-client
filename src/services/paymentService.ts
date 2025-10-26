import api from "./api";

export interface PaymentTransaction {
  id: string;
  provider: "mpesa" | "bank" | "manual";
  provider_txn_ref: string;
  mpesa_transaction_id?: string;
  amount: number;
  received_at: string;
  status: "pending" | "matched" | "unmatched" | "allocated";
  payer_name?: string;
  payer_msisdn?: string;
  account_number?: string;
  matched_subscription_id?: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentTransaction[];
  total: number;
  totalAmount: number;
}

export interface AllPaymentHistoryResponse {
  payments: PaymentTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentStatsResponse {
  summary: {
    total_payments: number;
    total_amount: number;
    period_days: number;
  };
  status_breakdown: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  provider_breakdown: Array<{
    provider: string;
    count: number;
    total: number;
  }>;
  recent_payments: PaymentTransaction[];
}

/**
 * Get payment history for a specific member
 */
export const getMemberPaymentHistory = async (
  memberId: string
): Promise<PaymentHistoryResponse> => {
  const response = await api.get(`/payments/member/${memberId}`);
  return response.data;
};

/**
 * Get all payment history (admin only)
 */
export const getAllPaymentHistory = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  provider?: string;
}): Promise<AllPaymentHistoryResponse> => {
  const response = await api.get("/payments", { params });
  return response.data;
};

/**
 * Get payment statistics (admin only)
 */
export const getPaymentStats = async (params?: {
  status?: string;
  provider?: string;
  days?: number;
}): Promise<PaymentStatsResponse> => {
  const response = await api.get("/payments/stats", { params });
  return response.data;
};

/**
 * Check payment status for polling
 */
export const checkPaymentStatus = async (
  paymentId: string
): Promise<{ success: boolean; status: string; payment: any }> => {
  const response = await api.get(`/payments/status/${paymentId}`);
  return response.data;
};

export default {
  getMemberPaymentHistory,
  getAllPaymentHistory,
  getPaymentStats,
  checkPaymentStatus,
};
