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
        return "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20";
      case "failed":
        return "border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20";
      case "processing":
        return "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20";
      default:
        return "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800";
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !settlement) return null;

  const totalCommissions =
    settlement.totals.total_agent_commissions +
    settlement.totals.total_super_agent_commissions;

  return (
    <AnimatePresence>
      {isOpen && settlement && (
        <motion.div
          initial={{ opacity: 0, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 backdrop-blur-[1.5px] flex items-center justify-center z-[9999] p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ x: "100%", scale: 1 }}
            animate={{ x: 0, scale: 1 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-4xl h-[calc(100vh-40px)] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Process Settlement
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(settlement.settlement_date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-6">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      Insurance
                    </p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(settlement.totals.total_insurance)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-700">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      Administrative
                    </p>
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      {formatCurrency(settlement.totals.total_admin)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                      Commissions
                    </p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
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
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <PiBuildingOfficeDuotone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      Insurance Payout
                    </h4>
                    {getStatusIcon(processingState.insurance)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <PiBuildingOfficeDuotone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      Administrative Payout
                    </h4>
                    {getStatusIcon(processingState.administrative)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <PiUsersThreeDuotone className="w-6 h-6 text-green-600 dark:text-green-400" />
                      Commission Payouts
                    </h4>
                    {getStatusIcon(processingState.commissions)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Send commission payouts to agents and super-agents via
                    M-Pesa
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Agent Commissions
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          settlement.totals.total_agent_commissions
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Super-Agent Commissions
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          settlement.totals.total_super_agent_commissions
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onInitiateCommissionPayouts &&
                      onInitiateCommissionPayouts()
                    }
                    disabled={
                      processingState.commissions === "completed" ||
                      processingState.commissions === "processing" ||
                      !onInitiateCommissionPayouts
                    }
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <FiUsers className="w-4 h-4" />
                    {processingState.commissions === "completed"
                      ? "Payouts Completed"
                      : "Process Commission Payouts"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completion: {settlement.completion_percentage || 0}%
                  </p>
                </div>
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProcessSettlementModal;
