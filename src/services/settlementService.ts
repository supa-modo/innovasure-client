/**
 * Settlement Service
 * API methods for settlement management
 */

import { api } from "./api";

export const settlementService = {
  /**
   * Get commission breakdown for a settlement batch
   */
  getCommissionBreakdown: async (batchId: string) => {
    const response = await api.get(
      `/settlements/${batchId}/commission-breakdown`
    );
    return response.data;
  },

  /**
   * Get settlement status
   */
  getSettlementStatus: async (batchId: string) => {
    const response = await api.get(`/settlements/${batchId}/status`);
    return response.data;
  },

  /**
   * Initiate insurance payout
   */
  initiateInsurancePayout: async (batchId: string, bankDetails: any) => {
    const response = await api.post(
      `/settlements/${batchId}/payouts/insurance`,
      {
        bankDetails,
      }
    );
    return response.data;
  },

  /**
   * Initiate administrative payout
   */
  initiateAdministrativePayout: async (batchId: string, bankDetails: any) => {
    const response = await api.post(
      `/settlements/${batchId}/payouts/administrative`,
      {
        bankDetails,
      }
    );
    return response.data;
  },

  /**
   * Record manual insurance payout
   */
  recordManualInsurancePayout: async (
    batchId: string,
    details: {
      transactionRef: string;
      transactionDate: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(
      `/settlements/${batchId}/payouts/insurance/manual`,
      details
    );
    return response.data;
  },

  /**
   * Record manual administrative payout
   */
  recordManualAdministrativePayout: async (
    batchId: string,
    details: {
      transactionRef: string;
      transactionDate: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(
      `/settlements/${batchId}/payouts/administrative/manual`,
      details
    );
    return response.data;
  },

  /**
   * Initiate commission payouts
   */
  initiateCommissionPayouts: async (batchId: string) => {
    const response = await api.post(
      `/settlements/${batchId}/payouts/commissions`
    );
    return response.data;
  },

  /**
   * Get failed payouts
   */
  getFailedPayouts: async (batchId: string) => {
    const response = await api.get(`/settlements/${batchId}/payouts/failed`);
    return response.data;
  },

  /**
   * Retry failed payout
   */
  retryFailedPayout: async (batchId: string, payoutId: string) => {
    const response = await api.post(
      `/settlements/${batchId}/payouts/${payoutId}/retry`
    );
    return response.data;
  },

  /**
   * Record manual payout
   */
  recordManualPayout: async (
    batchId: string,
    payoutId: string,
    details: {
      transactionRef: string;
      transactionDate: string;
      phone: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(
      `/settlements/${batchId}/payouts/${payoutId}/manual`,
      details
    );
    return response.data;
  },
};

export default settlementService;
