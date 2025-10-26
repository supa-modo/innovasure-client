/**
 * Failed Payouts Modal
 * Shows failed commission payouts with retry and manual entry options
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiRefreshCw, FiEdit3 } from "react-icons/fi";
import DataTable from "../DataTable";

interface FailedPayout {
  id: string;
  beneficiary_type: "agent" | "super_agent";
  beneficiary_id: string;
  amount: number;
  attempts: number;
  error_details: any;
  beneficiary?: {
    full_name: string;
    phone: string;
  };
}

interface FailedPayoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  failedPayouts: FailedPayout[];
  onRetry: (payoutId: string) => void;
  onManualEntry: (payout: FailedPayout) => void;
  formatCurrency: (amount: number) => string;
  retryingIds?: Set<string>;
}

const FailedPayoutsModal: React.FC<FailedPayoutsModalProps> = ({
  isOpen,
  onClose,
  failedPayouts,
  onRetry,
  onManualEntry,
  formatCurrency,
  retryingIds = new Set(),
}) => {
  if (!isOpen) return null;

  // Define columns for failed payouts table
  const columns = [
    {
      header: "Beneficiary",
      cell: (row: FailedPayout) => (
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
            {row.beneficiary?.full_name || row.beneficiary_id}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {row.beneficiary_type === "agent" ? "Agent" : "Super-Agent"}
          </p>
        </div>
      ),
    },
    {
      header: "Phone",
      cell: (row: FailedPayout) => (
        <p className="text-sm text-gray-900 dark:text-gray-300">
          {row.beneficiary?.phone || "N/A"}
        </p>
      ),
    },
    {
      header: "Amount",
      cell: (row: FailedPayout) => (
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatCurrency(row.amount)}
        </p>
      ),
    },
    {
      header: "Error",
      cell: (row: FailedPayout) => (
        <p className="text-sm text-red-600 dark:text-red-400 truncate max-w-xs">
          {row.error_details?.error ||
            row.error_details?.last_error ||
            "Unknown error"}
        </p>
      ),
    },
    {
      header: "Attempts",
      cell: (row: FailedPayout) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          {row.attempts}/5
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row: FailedPayout) => (
        <div className="flex items-center gap-2">
          {row.attempts < 5 && (
            <button
              onClick={() => onRetry(row.id)}
              disabled={retryingIds.has(row.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${retryingIds.has(row.id) ? "animate-spin" : ""}`}
              />
              {retryingIds.has(row.id) ? "Retrying..." : "Retry"}
            </button>
          )}
          <button
            onClick={() => onManualEntry(row)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
          >
            <FiEdit3 className="w-4 h-4" />
            Manual Entry
          </button>
        </div>
      ),
    },
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Failed Commission Payouts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {failedPayouts.length} payout
                  {failedPayouts.length !== 1 ? "s" : ""} failed
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
            <div className="overflow-y-auto flex-1 p-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <DataTable
                  columns={columns}
                  rows={failedPayouts}
                  showCheckboxes={false}
                  tableLoading={false}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FailedPayoutsModal;
