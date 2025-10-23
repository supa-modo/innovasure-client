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

export default {
  getMemberPaymentHistory,
  getAllPaymentHistory,
};
