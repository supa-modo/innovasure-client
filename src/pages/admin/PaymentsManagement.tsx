/**
 * Payments Management Page
 * Comprehensive payment tracking, reconciliation, and management for admins
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import DataTable from "../../components/DataTable";
import {
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import { api } from "../../services/api";
import {
  getPaymentStats,
  PaymentTransaction,
  downloadPaymentReceipt,
} from "../../services/paymentService";
import NotificationModal from "../../components/ui/NotificationModal";
import StatCard from "../../components/ui/StatCard";
import { TbReceipt } from "react-icons/tb";

interface Payment {
  id: string;
  provider: string;
  provider_txn_ref: string;
  mpesa_transaction_id?: string;
  account_number: string;
  payer_msisdn: string;
  payer_name: string;
  amount: number;
  received_at: string;
  status: "pending" | "matched" | "allocated" | "unmatched";
  allocated: boolean;
  matched_subscription_id?: string;
  settlement_batch_id?: string;
  member?: {
    id: string;
    full_name: string;
    phone: string;
  };
}

interface PaymentStats {
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

const PaymentsManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    summary: {
      total_payments: 0,
      total_amount: 0,
      period_days: 30,
    },
    status_breakdown: [],
    provider_breakdown: [],
    recent_payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);

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
    fetchPayments();
    fetchStats();
  }, [statusFilter, dateFrom, dateTo]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFrom, dateTo, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFrom) params.append("from", dateFrom);
      if (dateTo) params.append("to", dateTo);

      const response = await api.get(`/payments?${params.toString()}`);
      setPayments(response.data.payments || []);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to load payments. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params: any = {};
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const statsData = await getPaymentStats(params);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch payment stats:", error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFrom) params.append("from", dateFrom);
      if (dateTo) params.append("to", dateTo);
      params.append("format", "csv");

      const response = await api.get(`/payments/export?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `payments_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Payments exported successfully",
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to export payments",
      });
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      await downloadPaymentReceipt(payment.id);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Receipt downloaded successfully",
      });
    } catch (error: any) {
      console.error("Failed to download receipt:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.error || "Failed to download receipt",
      });
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchTerm === "" ||
      payment.payer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payer_msisdn.includes(searchTerm) ||
      payment.provider_txn_ref
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.account_number.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination calculations
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      allocated: {
        bg: "bg-green-100 border-green-300",
        text: "text-green-800",
        icon: FiCheckCircle,
      },
      matched: {
        bg: "bg-blue-100 border-blue-300",
        text: "text-blue-800 ",
        icon: FiCheckCircle,
      },
      pending: {
        bg: "bg-yellow-100 border-yellow-300",
        text: "text-yellow-800",
        icon: FiClock,
      },
      unmatched: {
        bg: "bg-red-100 border-red-300",
        text: "text-red-800",
        icon: FiXCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Payments Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track and manage all payment transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayments}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Payments"
            value={stats.summary.total_payments?.toLocaleString()}
            subtitle={`KShs ${stats.summary.total_amount.toLocaleString()}`}
            icon={<FiCheckCircle className="w-4 h-4" />}
            trend="up"
            trendValue=""
          />
          <StatCard
            title="Allocated"
            value={
              stats.status_breakdown
                .find((s) => s.status === "allocated")
                ?.count?.toLocaleString() || "0"
            }
            subtitle="Successfully processed"
            icon={<FiCheckCircle className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Unmatched"
            value={
              stats.status_breakdown
                .find((s) => s.status === "unmatched")
                ?.count?.toLocaleString() || "0"
            }
            subtitle="Requires attention"
            icon={<FiAlertCircle className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Pending"
            value={
              stats.status_breakdown
                .find((s) => s.status === "pending")
                ?.count?.toLocaleString() || "0"
            }
            subtitle="Processing"
            icon={<FiClock className="w-4 h-4" />}
            trend="neutral"
            trendValue=""
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, or reference..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="allocated">Allocated</option>
                <option value="matched">Matched</option>
                <option value="pending">Pending</option>
                <option value="unmatched">Unmatched</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input-field text-sm"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-sm border  overflow-hidden">
          <DataTable
            showAutoNumber={true}
            columns={[
              {
                id: "date",
                header: "Date",
                cell: (payment: Payment) => (
                  <p className="flex flex-col text-sm font-lexend text-gray-900">
                    <span>
                      {new Date(payment.received_at).toLocaleDateString(
                        "en-KE",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(payment.received_at).toLocaleTimeString(
                        "en-KE",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </p>
                ),
              },
              {
                id: "member",
                header: "Member",
                cell: (payment: Payment) => (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.payer_name}
                    </p>
                    <p className="text-sm text-gray-500 font-lexend">
                      {payment.payer_msisdn}
                    </p>
                  </div>
                ),
              },
              {
                id: "amount",
                header: "Amount",
                cell: (payment: Payment) => (
                  <p className="text-sm font-semibold font-lexend text-gray-900">
                    KShs. {payment.amount.toLocaleString()}
                  </p>
                ),
              },
              {
                id: "reference",
                header: "Mpesa Reference",
                cell: (payment: Payment) => (
                  <p className="text-xs font-mono text-gray-600">
                    {payment.mpesa_transaction_id || payment.provider_txn_ref}
                  </p>
                ),
              },
              {
                id: "status",
                header: "Status",
                cell: (payment: Payment) => getStatusBadge(payment.status),
              },
              {
                id: "actions",
                header: "Actions",
                cell: (payment: Payment) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(payment);
                      }}
                      className="text-gray-600 hover:text-blue-700 underline underline-offset-4 font-medium text-sm flex items-center gap-1"
                    >
                      View
                    </button>
                    <div className="h-5 w-px bg-gray-300"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReceipt(payment);
                      }}
                      className="text-primary-600 hover:text-primary-700 underline underline-offset-4 font-medium text-sm flex items-center gap-1"
                    >
                      <TbReceipt className="w-4 h-4" />
                      Receipt
                    </button>
                  </div>
                ),
              },
            ]}
            rows={paginatedPayments}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            tableLoading={loading}
            hasSearched={!!searchTerm}
            showCheckboxes={false}
            getRowId={(payment: Payment) => payment.id}
          />
        </div>

        {/* Payment Details Modal */}
        {showDetailsModal && selectedPayment && (
          <PaymentDetailsModal
            payment={selectedPayment}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedPayment(null);
            }}
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

// Payment Details Modal Component
const PaymentDetailsModal: React.FC<{
  payment: Payment;
  onClose: () => void;
}> = ({ payment, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Transaction Reference
              </label>
              <p className="text-sm font-mono text-gray-900 mt-1">
                {payment.provider_txn_ref}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Amount
              </label>
              <p className="text-lg font-bold text-gray-900 mt-1">
                KShs {payment.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Payer Name
              </label>
              <p className="text-sm text-gray-900 mt-1">{payment.payer_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Phone Number
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {payment.payer_msisdn}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Received At
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(payment.received_at).toLocaleString("en-KE")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    payment.status === "allocated"
                      ? "bg-green-100 text-green-800"
                      : payment.status === "matched"
                        ? "bg-blue-100 text-blue-800"
                        : payment.status === "unmatched"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {payment.status.charAt(0).toUpperCase() +
                    payment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentsManagement;
