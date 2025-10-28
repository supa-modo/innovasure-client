/**
 * Process Settlement Modal
 * Comprehensive settlement processing with granular payout management
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiClock,
  FiUsers,
  FiSend,
  FiEdit3,
} from "react-icons/fi";
import { PiBuildingOfficeDuotone, PiUsersThreeDuotone } from "react-icons/pi";
import { formatDate } from "../helpers/formatDate";
import PayoutTrackingModal from "./PayoutTrackingModal";
import { initiateCommissionPayouts } from "../../services/settlementService";

interface SettlementBatch {
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
}

interface ProcessSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: SettlementBatch | null;
  onInitiateInsurancePayout?: (bankDetails: any) => void;
  onInitiateAdministrativePayout?: (bankDetails: any) => void;
  onRecordManualInsurance?: (details: any) => void;
  onRecordManualAdministrative?: (details: any) => void;
  onInitiateCommissionPayouts?: () => void;
  formatCurrency: (amount: number) => string;
}

const ProcessSettlementModal: React.FC<ProcessSettlementModalProps> = ({
  isOpen,
  onClose,
  settlement,
  formatCurrency,
  onInitiateCommissionPayouts,
}) => {
  const [processingState, setProcessingState] = useState({
    insurance: "pending" as "pending" | "processing" | "completed" | "failed",
    administrative: "pending" as
      | "pending"
      | "processing"
      | "completed"
      | "failed",
    commissions: "pending" as "pending" | "processing" | "completed" | "failed",
  });
  const [isPayoutTrackingOpen, setIsPayoutTrackingOpen] = useState(false);
  const [isInitiatingPayouts, setIsInitiatingPayouts] = useState(false);

  useEffect(() => {
    if (settlement?.payout_status) {
      const status = settlement.payout_status;
      setProcessingState({
        insurance: mapPayoutStatus(status.insurance),
        administrative: mapPayoutStatus(status.administrative),
        commissions: mapPayoutStatus(status.commissions),
      });
    }
  }, [settlement]);

  const mapPayoutStatus = (
    status?: string
  ): "pending" | "processing" | "completed" | "failed" => {
    if (!status) return "pending";
    if (status === "completed" || status === "manual") return "completed";
    if (status === "in_progress") return "processing";
    if (status === "failed" || status === "partially_failed") return "failed";
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-gray-300 bg-gray-50";
      case "failed":
        return "border-gray-300 bg-gray-50";
      case "processing":
        return "border-gray-300 bg-gray-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const handleInitiateCommissionPayouts = async () => {
    if (!settlement) return;

    setIsInitiatingPayouts(true);
    try {
      // Call the API to initiate payouts
      await initiateCommissionPayouts(settlement.id);

      // Open tracking modal
      setIsPayoutTrackingOpen(true);

      // Also call the legacy callback if provided
      if (onInitiateCommissionPayouts) {
        onInitiateCommissionPayouts();
      }
    } catch (error: any) {
      alert(error.message || "Failed to initiate commission payouts");
    } finally {
      setIsInitiatingPayouts(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPayoutTrackingOpen) {
      onClose();
    }
  };

  if (!isOpen || !settlement) return null;

  const totalCommissions =
    settlement.totals.total_agent_commissions +
    settlement.totals.total_super_agent_commissions;

  return (
    <>
      <AnimatePresence>
        {isOpen && settlement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] flex items-start justify-end z-50 p-3 font-lexend"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="lg:w-[45%] w-[96] h-[calc(100vh-20px)] bg-white shadow-2xl overflow-hidden rounded-3xl border border-gray-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <h3 className="text-xl font-bold text-primary-600">
                    Process Settlement
                  </h3>
                  <div className="w-0.5 h-6 bg-gray-300 rounded-full"></div>
                  <p className="text-[0.9rem] text-gray-600 mt-1">
                    {formatDate(settlement.settlement_date)}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-2 hover:bg-gray-100"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-6 py-6">
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-linear-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border border-gray-300">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Insurance
                      </p>
                      <p className="text-2xl font-bold text-gray-700">
                        {formatCurrency(settlement.totals.total_insurance)}
                      </p>
                    </div>
                    <div className="bg-linear-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border border-gray-300">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Administrative
                      </p>
                      <p className="text-2xl font-bold text-gray-700">
                        {formatCurrency(settlement.totals.total_admin)}
                      </p>
                    </div>
                    <div className="bg-linear-to-r from-gray-100 to-gray-200 rounded-2xl p-6 border border-gray-300">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Commissions
                      </p>
                      <p className="text-2xl font-bold text-gray-700">
                        {formatCurrency(totalCommissions)}
                      </p>
                    </div>
                  </div>

                  {/* Insurance Payout Section */}
                  <div
                    className={`rounded-2xl p-6 border-2 transition-all ${getStatusColor(
                      processingState.insurance
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <PiBuildingOfficeDuotone className="w-6 h-6 text-blue-600 " />
                        Insurance Payout
                      </h4>
                      {getStatusIcon(processingState.insurance)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Transfer insurance portion to designated bank account
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Would open bank details form
                          alert("Bank details form would open here");
                        }}
                        disabled={
                          processingState.insurance === "completed" ||
                          processingState.insurance === "processing"
                        }
                        className="btn-primary flex items-center gap-2"
                      >
                        <FiSend className="w-4 h-4" />
                        {processingState.insurance === "completed"
                          ? "Completed"
                          : "Initiate Insurance Payout"}
                      </button>
                      {processingState.insurance === "failed" && (
                        <button
                          onClick={() => {
                            // Would open manual transaction modal
                            alert("Manual transaction form would open here");
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <FiEdit3 className="w-4 h-4" />
                          Manual Entry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Administrative Payout Section */}
                  <div
                    className={`rounded-2xl p-6 border-2 transition-all ${getStatusColor(
                      processingState.administrative
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <PiBuildingOfficeDuotone className="w-6 h-6 text-purple-600" />
                        Administrative Payout
                      </h4>
                      {getStatusIcon(processingState.administrative)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Transfer administrative portion to designated bank account
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Would open bank details form
                          alert("Bank details form would open here");
                        }}
                        disabled={
                          processingState.administrative === "completed" ||
                          processingState.administrative === "processing"
                        }
                        className="btn-primary flex items-center gap-2"
                      >
                        <FiSend className="w-4 h-4" />
                        {processingState.administrative === "completed"
                          ? "Completed"
                          : "Initiate Administrative Payout"}
                      </button>
                      {processingState.administrative === "failed" && (
                        <button
                          onClick={() => {
                            // Would open manual transaction modal
                            alert("Manual transaction form would open here");
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <FiEdit3 className="w-4 h-4" />
                          Manual Entry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Commission Payouts Section */}
                  <div
                    className={`rounded-2xl p-6 border-2 transition-all ${getStatusColor(
                      processingState.commissions
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <PiUsersThreeDuotone className="w-6 h-6 text-green-600" />
                        Commission Payouts
                      </h4>
                      {getStatusIcon(processingState.commissions)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Send commission payouts to agents and super-agents via
                      M-Pesa
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1">
                          Agent Commissions
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(
                            settlement.totals.total_agent_commissions
                          )}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1">
                          Super-Agent Commissions
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(
                            settlement.totals.total_super_agent_commissions
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleInitiateCommissionPayouts}
                      disabled={
                        processingState.commissions === "completed" ||
                        processingState.commissions === "processing" ||
                        isInitiatingPayouts ||
                        isPayoutTrackingOpen
                      }
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInitiatingPayouts ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Initiating...
                        </>
                      ) : (
                        <>
                          <FiUsers className="w-4 h-4" />
                          {processingState.commissions === "completed"
                            ? "Payouts Completed"
                            : "Process Commission Payouts"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-white px-6 py-4 shrink-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-600">
                    Completion: {settlement.completion_percentage || 0}%
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout Tracking Modal (Stacked on top) */}
      <PayoutTrackingModal
        isOpen={isPayoutTrackingOpen}
        onClose={() => setIsPayoutTrackingOpen(false)}
        settlementId={settlement?.id || ""}
        formatCurrency={formatCurrency}
      />
    </>
  );
};

export default ProcessSettlementModal;
