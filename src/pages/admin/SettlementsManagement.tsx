/**
 * Settlements Management Page
 * Comprehensive settlement batch management, payout processing, and reconciliation
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import {
  FiDollarSign,
  FiUsers,
  FiUserCheck,
  FiTrendingUp,
  FiDownload,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSend,
  FiX,
} from "react-icons/fi";
import { api } from "../../services/api";
import NotificationModal from "../../components/ui/NotificationModal";
import StatCard from "../../components/ui/StatCard";

interface SettlementBatch {
  id: string;
  settlement_date: string;
  status: "open" | "processed";
  totals: {
    total_payments: number;
    total_agent_commissions: number;
    total_super_agent_commissions: number;
    total_insurance: number;
    total_admin: number;
    payment_count: number;
    agents: {
      [key: string]: {
        payments: number;
        commission: number;
      };
    };
    super_agents: {
      [key: string]: {
        agents: number;
        commission: number;
      };
    };
  };
  generated_by: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
}

interface PayoutTransaction {
  id: string;
  batch_id: string;
  beneficiary_type: "agent" | "super_agent";
  beneficiary_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  provider: string;
  conversation_id?: string;
  attempts: number;
  last_attempt_at?: string;
  error_details?: any;
  beneficiary?: {
    full_name: string;
    phone: string;
  };
}

const SettlementsManagement: React.FC = () => {
  const [batches, setBatches] = useState<SettlementBatch[]>([]);
  const [payouts, setPayouts] = useState<PayoutTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingSettlement, setGeneratingSettlement] = useState(false);

  const [notification, setNotification] = useState({
    isOpen: false,
    type: "info" as
      | "info"
      | "success"
      | "error"
      | "warning"
      | "confirm"
      | "delete",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchBatches();
  }, [statusFilter]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await api.get(`/settlements?${params.toString()}`);
      setBatches(response.data.data?.batches || []);
    } catch (error: any) {
      console.error("Failed to fetch settlement batches:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to load settlement batches. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSettlement = async (date: string) => {
    try {
      setGeneratingSettlement(true);
      const response = await api.post("/settlements/generate", {
        date: new Date(date).toISOString(),
      });

      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message:
          response.data.data?.message ||
          `Settlement batch generated successfully for ${date}`,
      });

      setShowGenerateModal(false);
      fetchBatches();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message:
          error.response?.data?.error || "Failed to generate settlement batch",
      });
    } finally {
      setGeneratingSettlement(false);
    }
  };

  const handleInitiatePayouts = async (batchId: string) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to initiate bulk payouts for this settlement batch? This action cannot be undone."
      );

      if (!confirmed) return;

      const response = await api.post(`/settlements/${batchId}/payouts`);

      setNotification({
        isOpen: true,
        type: "success",
        title: "Payouts Initiated",
        message: `${response.data.data?.successful} payouts initiated successfully. ${response.data.data?.failed} failed.`,
      });

      fetchBatches();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.error || "Failed to initiate payouts",
      });
    }
  };

  const handleMarkAsProcessed = async (batchId: string) => {
    try {
      const notes = window.prompt(
        "Enter any notes for this settlement (optional):"
      );

      await api.post(`/settlements/${batchId}/process`, { notes });

      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Settlement batch marked as processed",
      });

      fetchBatches();
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message:
          error.response?.data?.error || "Failed to process settlement batch",
      });
    }
  };

  const handleViewDetails = async (batch: SettlementBatch) => {
    setSelectedBatch(batch);
    setShowDetailsModal(true);

    // Fetch payouts for this batch
    try {
      const response = await api.get(`/settlements/${batch.id}/payouts`);
      setPayouts(response.data.data?.payouts || []);
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
    }
  };

  const handleExport = async (batchId: string) => {
    try {
      const response = await api.get(`/settlements/${batchId}/export`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `settlement_${batchId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Settlement report exported successfully",
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to export settlement report",
      });
    }
  };

  const totalSettlementValue = batches.reduce(
    (sum, batch) => sum + batch.totals.total_payments,
    0
  );
  const totalAgentCommissions = batches.reduce(
    (sum, batch) => sum + batch.totals.total_agent_commissions,
    0
  );
  const totalSuperAgentCommissions = batches.reduce(
    (sum, batch) => sum + batch.totals.total_super_agent_commissions,
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Settlements Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage settlement batches and commission payouts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBatches}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
            >
              <FiDollarSign className="w-4 h-4" />
              Generate Settlement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Settlement Value"
            value={`KShs ${totalSettlementValue.toLocaleString()}`}
            subtitle={`${batches.length} batches`}
            icon={<FiDollarSign className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Agent Commissions"
            value={`KShs ${totalAgentCommissions.toLocaleString()}`}
            subtitle="To be paid"
            icon={<FiUserCheck className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Super-Agent Commissions"
            value={`KShs ${totalSuperAgentCommissions.toLocaleString()}`}
            subtitle="To be paid"
            icon={<FiUsers className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Open Batches"
            value={batches.filter((b) => b.status === "open").length.toString()}
            subtitle="Pending processing"
            icon={<FiClock className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="processed">Processed</option>
            </select>
          </div>
        </div>

        {/* Settlement Batches Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                No settlement batches found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Settlement Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Commissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {batches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {new Date(batch.settlement_date).toLocaleDateString(
                          "en-KE",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-300">
                        KShs {batch.totals.total_payments.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {batch.totals.payment_count} payments
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        <div>
                          Agents: KShs{" "}
                          {batch.totals.total_agent_commissions.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Super-Agents: KShs{" "}
                          {batch.totals.total_super_agent_commissions.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            batch.status === "processed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {batch.status === "processed" ? (
                            <FiCheckCircle className="w-3 h-3" />
                          ) : (
                            <FiClock className="w-3 h-3" />
                          )}
                          {batch.status.charAt(0).toUpperCase() +
                            batch.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleViewDetails(batch)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View
                        </button>
                        {batch.status === "open" && (
                          <>
                            <button
                              onClick={() => handleInitiatePayouts(batch.id)}
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              Pay Out
                            </button>
                            <button
                              onClick={() => handleMarkAsProcessed(batch.id)}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark Processed
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleExport(batch.id)}
                          className="text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Export
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Generate Settlement Modal */}
        {showGenerateModal && (
          <GenerateSettlementModal
            onClose={() => setShowGenerateModal(false)}
            onGenerate={handleGenerateSettlement}
            loading={generatingSettlement}
          />
        )}

        {/* Settlement Details Modal */}
        {showDetailsModal && selectedBatch && (
          <SettlementDetailsModal
            batch={selectedBatch}
            payouts={payouts}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedBatch(null);
              setPayouts([]);
            }}
            onInitiatePayouts={handleInitiatePayouts}
            onMarkAsProcessed={handleMarkAsProcessed}
          />
        )}

        {/* Notification Modal */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification({ ...notification, isOpen: false })}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      </div>
    </AdminLayout>
  );
};

// Generate Settlement Modal Component
const GenerateSettlementModal: React.FC<{
  onClose: () => void;
  onGenerate: (date: string) => void;
  loading: boolean;
}> = ({ onClose, onGenerate, loading }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() - 86400000).toISOString().split("T")[0]
  ); // Yesterday

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Generate Settlement Batch
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Settlement Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select the date for which to generate the settlement batch
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              This will aggregate all allocated payments for the selected date
              and create commission entries for agents and super-agents.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(selectedDate)}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Settlement"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Settlement Details Modal Component
const SettlementDetailsModal: React.FC<{
  batch: SettlementBatch;
  payouts: PayoutTransaction[];
  onClose: () => void;
  onInitiatePayouts: (batchId: string) => void;
  onMarkAsProcessed: (batchId: string) => void;
}> = ({ batch, payouts, onClose, onInitiatePayouts, onMarkAsProcessed }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Settlement Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total Payments
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                KShs {batch.totals.total_payments.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Agent Commissions
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                KShs {batch.totals.total_agent_commissions.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Super-Agent Commissions
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                KShs{" "}
                {batch.totals.total_super_agent_commissions.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Payment Count
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {batch.totals.payment_count}
              </p>
            </div>
          </div>

          {/* Payouts Table */}
          {payouts.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payout Transactions
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Beneficiary
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payouts.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                          {payout.beneficiary?.full_name ||
                            payout.beneficiary_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                          {payout.beneficiary_type}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-300">
                          KShs {payout.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              payout.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : payout.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          {batch.status === "open" && (
            <div className="flex gap-3">
              <button
                onClick={() => onInitiatePayouts(batch.id)}
                className="btn-primary flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                Initiate Payouts
              </button>
              <button
                onClick={() => onMarkAsProcessed(batch.id)}
                className="btn-primary flex items-center gap-2"
              >
                <FiCheckCircle className="w-4 h-4" />
                Mark Processed
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SettlementsManagement;
