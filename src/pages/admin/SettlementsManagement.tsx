/**
 * Settlements Management Page
 * Comprehensive settlement batch management with granular payout processing
 */

import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  FiDollarSign,
  FiUsers,
  FiUserCheck,
  FiRefreshCw,
  FiClock,
} from "react-icons/fi";
import { api } from "../../services/api";
import NotificationModal from "../../components/ui/NotificationModal";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/DataTable";
import ProcessSettlementModal from "../../components/admin/ProcessSettlementModal";
import CommissionBreakdownModal from "../../components/admin/CommissionBreakdownModal";
import GenerateSettlementModal from "../../components/admin/GenerateSettlementModal";
import settlementService from "../../services/settlementService";
import { formatDate } from "@/components/helpers/formatDate";

interface SettlementBatch {
  id: string;
  settlement_date: string;
  status: "open" | "processed" | "reconciliation" | "completed";
  totals: {
    total_payments: number;
    total_agent_commissions: number;
    total_super_agent_commissions: number;
    total_insurance: number;
    total_admin: number;
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
  generated_by: string;
  created_at: string;
}

const SettlementsManagement: React.FC = () => {
  const [batches, setBatches] = useState<SettlementBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(
    null
  );
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [commissionBreakdown, setCommissionBreakdown] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [notification, setNotification] = useState({
    isOpen: false,
    type: "info" as "info" | "success" | "error" | "warning",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchBatches();
  }, [statusFilter, currentPage]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("limit", itemsPerPage.toString());
      params.append("offset", ((currentPage - 1) * itemsPerPage).toString());

      const response = await api.get(`/settlements?${params.toString()}`);
      setBatches(response.data.data?.batches || []);
      setTotalItems(response.data.data?.total || 0);
      setTotalPages(Math.ceil((response.data.data?.total || 0) / itemsPerPage));
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

  const formatCurrency = (amount: number) => {
    return `KShs ${amount.toLocaleString()}`;
  };


  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;

    const statusColors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800",
      completed: "bg-green-100 text-green-800 ",
      failed: "bg-red-100 text-red-800 ",
      manual: "bg-blue-100 text-blue-800 ",
      in_progress:
        "bg-yellow-100 text-yellow-800",
      partially_failed:
        "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || ""}`}
      >
        {status}
      </span>
    );
  };

  const handleProcessSettlement = (batch: SettlementBatch) => {
    setSelectedBatch(batch);
    setShowProcessModal(true);
  };

  const handleViewCommissionBreakdown = async (batch: SettlementBatch) => {
    try {
      const response = await settlementService.getCommissionBreakdown(batch.id);
      setCommissionBreakdown(response.data.breakdown);
      setShowCommissionModal(true);
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to load commission breakdown",
      });
    }
  };

  const handleGenerateSettlement = async (date: string) => {
    setIsGenerating(true);
    try {
      const response = await api.post("/settlements/generate", {
        date: new Date(date).toISOString(),
      });

      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message:
          response.data.data?.message ||
          "Settlement batch generated successfully",
      });

      fetchBatches();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message:
          error.response?.data?.error || "Failed to generate settlement batch",
      });
      throw error; // Re-throw to let the modal handle the error state
    } finally {
      setIsGenerating(false);
    }
  };

  // DataTable Columns
  const columns = [
    {
      header: "Settlement Date",
      cell: (row: SettlementBatch) => (
        <span className="font-lexend text-gray-600 tracking-wide">
          {formatDate(row.settlement_date)}
        </span>
      ),
    },
    {
      header: "Total Amount",
      cell: (row: SettlementBatch) => formatCurrency(row.totals.total_payments),
    },
    {
      header: "Payments",
      cell: (row: SettlementBatch) => `${row.totals.payment_count} payments`,
    },
    {
      header: "Insurance",
      cell: (row: SettlementBatch) => (
        <div>
          <p className="text-sm font-semibold">
            {formatCurrency(row.totals.total_insurance)}
          </p>
          {getStatusBadge(row.payout_status?.insurance)}
        </div>
      ),
    },
    {
      header: "Administrative",
      cell: (row: SettlementBatch) => (
        <div>
          <p className="text-sm font-semibold">
            {formatCurrency(row.totals.total_admin)}
          </p>
          {getStatusBadge(row.payout_status?.administrative)}
        </div>
      ),
    },
    {
      header: "Commissions",
      cell: (row: SettlementBatch) => {
        const total =
          row.totals.total_agent_commissions +
          row.totals.total_super_agent_commissions;
        return (
          <div
            className="cursor-pointer hover:text-primary-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleViewCommissionBreakdown(row);
            }}
          >
            <p className="text-sm font-semibold">{formatCurrency(total)}</p>
            {getStatusBadge(row.payout_status?.commissions)}
            <p className="text-xs text-gray-500 mt-1">
              Click to view breakdown
            </p>
          </div>
        );
      },
    },
    {
      header: "Progress",
      cell: (row: SettlementBatch) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${row.completion_percentage || 0}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {row.completion_percentage || 0}%
            </span>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              row.status === "completed"
                ? "bg-green-100 text-green-800 "
                : row.status === "processed"
                  ? "bg-blue-100 text-blue-800 "
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {row.status}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (row: SettlementBatch) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProcessSettlement(row);
            }}
            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {row.status === "completed" ? "View" : "Process"}
          </button>
        </div>
      ),
    },
  ];

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Settlements Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
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
              className="px-6 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
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
            value={formatCurrency(totalSettlementValue)}
            subtitle={`${batches.length} batches`}
            icon={<FiDollarSign className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Agent Commissions"
            value={formatCurrency(totalAgentCommissions)}
            subtitle="To be paid"
            icon={<FiUserCheck className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Super-Agent Commissions"
            value={formatCurrency(totalSuperAgentCommissions)}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field max-w-xs"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="processed">Processed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-xl shadow-sm border  overflow-hidden">
          <DataTable
            showAutoNumber={true}
            columns={columns}
            rows={batches}
            totalItems={totalItems}
            startIndex={(currentPage - 1) * itemsPerPage + 1}
            endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isAllSelected={false}
            onToggleAll={() => {}}
            isRowSelected={() => false}
            onToggleRow={() => {}}
            getRowId={(row) => row.id}
            onRowClick={() => {}}
            tableLoading={loading}
            hasSearched={false}
            showCheckboxes={false}
          />
        </div>

        {/* Modals */}
        {showProcessModal && selectedBatch && (
          <ProcessSettlementModal
            isOpen={showProcessModal}
            onClose={() => {
              setShowProcessModal(false);
              setSelectedBatch(null);
            }}
            settlement={selectedBatch}
            onInitiateInsurancePayout={() => {}}
            onInitiateAdministrativePayout={() => {}}
            onRecordManualInsurance={() => {}}
            onRecordManualAdministrative={() => {}}
            onInitiateCommissionPayouts={async () => {
              try {
                await settlementService.initiateCommissionPayouts(
                  selectedBatch.id
                );
                setNotification({
                  isOpen: true,
                  type: "success",
                  title: "Success",
                  message: "Commission payouts initiated successfully",
                });
                fetchBatches();
              } catch (error: any) {
                setNotification({
                  isOpen: true,
                  type: "error",
                  title: "Error",
                  message:
                    error.response?.data?.error ||
                    "Failed to initiate commission payouts",
                });
              }
            }}
            formatCurrency={formatCurrency}
          />
        )}

        {showCommissionModal && commissionBreakdown && (
          <CommissionBreakdownModal
            isOpen={showCommissionModal}
            onClose={() => {
              setShowCommissionModal(false);
              setCommissionBreakdown(null);
            }}
            commissionBreakdown={commissionBreakdown}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Generate Settlement Modal */}
        <GenerateSettlementModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerateSettlement}
          loading={isGenerating}
        />

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

export default SettlementsManagement;
