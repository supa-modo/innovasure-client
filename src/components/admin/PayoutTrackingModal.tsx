/**
 * Payout Tracking Modal
 * Real-time tracking of commission payouts with retry and manual entry capabilities
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiClock,
  FiRefreshCw,
  FiEdit3,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
} from "react-icons/fi";
import {
  getPayoutStatus,
  getPayoutDetails,
  retryPayout,
  recordManualPayout,
  PayoutDetail,
  PayoutStatusResponse,
} from "../../services/settlementService";
import PayoutManualEntryModal from "./PayoutManualEntryModal";

interface PayoutTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlementId: string;
  formatCurrency: (amount: number) => string;
}

type TabType = "all" | "pending" | "failed" | "completed";

const PayoutTrackingModal: React.FC<PayoutTrackingModalProps> = ({
  isOpen,
  onClose,
  settlementId,
  formatCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [statusData, setStatusData] = useState<PayoutStatusResponse | null>(
    null
  );
  const [payouts, setPayouts] = useState<PayoutDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedPayout, setExpandedPayout] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutDetail | null>(
    null
  );
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryingPayouts, setRetryingPayouts] = useState<Set<string>>(
    new Set()
  );

  // Fetch payout status and details
  const fetchData = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setError(null);

        const [status, details] = await Promise.all([
          getPayoutStatus(settlementId),
          getPayoutDetails(settlementId),
        ]);

        setStatusData(status);
        setPayouts(details.payouts);
      } catch (err: any) {
        console.error("Error fetching payout data:", err);
        setError(err.message || "Failed to fetch payout data");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [settlementId]
  );

  // Initial fetch
  useEffect(() => {
    if (isOpen) {
      fetchData(true);
    }
  }, [isOpen, fetchData]);

  // Auto-refresh every 3 seconds while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // Only auto-refresh if not all payouts are completed
      if (statusData && statusData.pending + statusData.failed > 0) {
        fetchData(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, statusData, fetchData]);

  // Handle retry payout
  const handleRetry = async (payoutId: string) => {
    setRetryingPayouts((prev) => new Set(prev).add(payoutId));
    try {
      await retryPayout(settlementId, payoutId);
      // Refresh data after retry
      await fetchData(false);
    } catch (err: any) {
      alert(err.message || "Failed to retry payout");
    } finally {
      setRetryingPayouts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(payoutId);
        return newSet;
      });
    }
  };

  // Handle manual entry
  const handleManualEntry = (payout: PayoutDetail) => {
    setSelectedPayout(payout);
    setIsManualEntryOpen(true);
  };

  // Submit manual entry
  const handleSubmitManualEntry = async (details: any) => {
    if (!selectedPayout) return;

    try {
      await recordManualPayout(settlementId, selectedPayout.id, details);
      setIsManualEntryOpen(false);
      setSelectedPayout(null);
      // Refresh data
      await fetchData(false);
    } catch (err: any) {
      throw err;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <FiClock className="w-5 h-5 text-blue-600" />;
      default:
        return <FiLoader className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter payouts based on active tab
  const filteredPayouts = payouts.filter((payout) => {
    if (activeTab === "all") return true;
    return payout.status === activeTab;
  });

  // Calculate progress percentage
  const progressPercentage = statusData
    ? Math.round((statusData.completed / statusData.total) * 100) || 0
    : 0;

  // Check if all payouts are completed
  const allCompleted =
    statusData &&
    statusData.total > 0 &&
    statusData.completed === statusData.total;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && allCompleted) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[55] p-4 font-lexend"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] border border-gray-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-primary-600">
                    Commission Payout Tracking
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Real-time monitoring of agent and super-agent payouts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchData(false)}
                    disabled={isRefreshing}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <FiRefreshCw
                      className={`w-5 h-5 text-gray-600 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={onClose}
                    disabled={!allCompleted}
                    className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !allCompleted
                        ? "Complete all payouts before closing"
                        : "Close"
                    }
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Loading payout data...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Error
                      </p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Progress Section */}
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 mb-6 border border-primary-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-gray-900">
                          Overall Progress
                        </h4>
                        <span className="text-2xl font-bold text-primary-600">
                          {progressPercentage}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="bg-gradient-to-r from-primary-600 to-blue-600 h-full rounded-full"
                        />
                      </div>

                      {/* Status Counts */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Total</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {statusData?.total || 0}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                          <p className="text-xs text-green-700 mb-1">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-green-800">
                            {statusData?.completed || 0}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Pending</p>
                          <p className="text-2xl font-bold text-blue-800">
                            {statusData?.pending || 0}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                          <p className="text-xs text-red-700 mb-1">Failed</p>
                          <p className="text-2xl font-bold text-red-800">
                            {statusData?.failed || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-gray-200">
                      {(
                        [
                          { key: "all", label: "All" },
                          { key: "pending", label: "Pending" },
                          { key: "failed", label: "Failed" },
                          { key: "completed", label: "Completed" },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                            activeTab === tab.key
                              ? "border-primary-600 text-primary-600"
                              : "border-transparent text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Payout List */}
                    <div className="space-y-3">
                      {filteredPayouts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No {activeTab !== "all" ? activeTab : ""} payouts</p>
                        </div>
                      ) : (
                        filteredPayouts.map((payout) => (
                          <div
                            key={payout.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                {getStatusIcon(payout.status)}
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {payout.beneficiary_name}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500 capitalize">
                                      {payout.beneficiary_type.replace(
                                        "_",
                                        "-"
                                      )}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {payout.beneficiary_phone}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusBadgeClass(
                                        payout.status
                                      )}`}
                                    >
                                      {payout.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">
                                    {formatCurrency(Number(payout.amount))}
                                  </p>
                                  {payout.attempts > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {payout.attempts} attempt
                                      {payout.attempts !== 1 ? "s" : ""}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                {payout.status === "failed" && (
                                  <>
                                    {payout.attempts < 5 && (
                                      <button
                                        onClick={() => handleRetry(payout.id)}
                                        disabled={retryingPayouts.has(
                                          payout.id
                                        )}
                                        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-1 disabled:opacity-50"
                                      >
                                        {retryingPayouts.has(payout.id) ? (
                                          <>
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Retrying...
                                          </>
                                        ) : (
                                          <>
                                            <FiRefreshCw className="w-3 h-3" />
                                            Retry
                                          </>
                                        )}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleManualEntry(payout)}
                                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-semibold flex items-center gap-1"
                                    >
                                      <FiEdit3 className="w-3 h-3" />
                                      Manual
                                    </button>
                                  </>
                                )}

                                {payout.error_details &&
                                  Object.keys(payout.error_details).length >
                                    0 && (
                                    <button
                                      onClick={() =>
                                        setExpandedPayout(
                                          expandedPayout === payout.id
                                            ? null
                                            : payout.id
                                        )
                                      }
                                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      {expandedPayout === payout.id ? (
                                        <FiChevronUp className="w-4 h-4 text-gray-600" />
                                      ) : (
                                        <FiChevronDown className="w-4 h-4 text-gray-600" />
                                      )}
                                    </button>
                                  )}
                              </div>
                            </div>

                            {/* Error Details (Expanded) */}
                            {expandedPayout === payout.id &&
                              payout.error_details && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-2">
                                    Error Details:
                                  </p>
                                  <pre className="text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto">
                                    {JSON.stringify(
                                      payout.error_details,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 shrink-0 rounded-b-3xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {!allCompleted && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        <span>Auto-refreshing every 3 seconds...</span>
                      </div>
                    )}
                    {allCompleted && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FiCheckCircle className="w-4 h-4" />
                        <span className="font-semibold">
                          All payouts completed!
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    disabled={!allCompleted}
                    className="px-6 py-2.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                    title={
                      !allCompleted
                        ? "Complete all payouts before closing"
                        : "Close"
                    }
                  >
                    {allCompleted ? "Close" : "Processing..."}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Entry Modal */}
      <PayoutManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => {
          setIsManualEntryOpen(false);
          setSelectedPayout(null);
        }}
        payout={selectedPayout}
        onSubmit={handleSubmitManualEntry}
        formatCurrency={formatCurrency}
      />
    </>
  );
};

export default PayoutTrackingModal;

