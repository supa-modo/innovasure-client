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
  status: "pending" | "matched" | "allocated" | "unmatched" | "failed";
  allocated: boolean;
  matched_subscription_id?: string;
  settlement_batch_id?: string;
  raw_payload?: any;
  member?: {
    id: string;
    full_name: string;
    phone: string;
  };
  subscription?: {
    id: string;
    plan?: {
      name: string;
      coverage_amount: number;
    };
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
  // Default to last 30 days
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
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
      const params: any = { days: 30 }; // Default to 30 days
      if (dateFrom && dateTo) {
        // Calculate days between dateFrom and dateTo
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const diffTime = Math.abs(to.getTime() - from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        params.days = diffDays;
      }

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
        bg: "bg-orange-100 border-orange-300",
        text: "text-orange-800",
        icon: FiAlertCircle,
      },
      failed: {
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
                <option value="failed">Failed</option>
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
  const getErrorDetails = () => {
    if (payment.status !== "failed" || !payment.raw_payload) return null;

    // Try to extract error from various callback formats
    const callback = payment.raw_payload.callback || payment.raw_payload;
    const resultCode = callback.ResultCode || callback.resultCode;
    const resultDesc =
      callback.ResultDesc || callback.resultDesc || callback.message;

    return { code: resultCode, message: resultDesc };
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white h-full w-full md:w-[600px] shadow-2xl overflow-y-auto"
      >
        {/* Header with Gradient */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Payment Details</h3>
              <p className="text-blue-100 text-sm mt-1">
                Transaction Reference: {payment.provider_txn_ref}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiXCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Details Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TbReceipt className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Transaction Details
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Amount
                </label>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  KShs {payment.amount.toLocaleString("en-KE")}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                      payment.status === "allocated"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : payment.status === "matched"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : payment.status === "failed"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : payment.status === "unmatched"
                              ? "bg-orange-100 text-orange-800 border-orange-300"
                              : "bg-yellow-100 text-yellow-800 border-yellow-300"
                    }`}
                  >
                    {payment.status === "allocated" && (
                      <FiCheckCircle className="w-3 h-3" />
                    )}
                    {payment.status === "matched" && (
                      <FiCheckCircle className="w-3 h-3" />
                    )}
                    {payment.status === "failed" && (
                      <FiXCircle className="w-3 h-3" />
                    )}
                    {payment.status === "unmatched" && (
                      <FiAlertCircle className="w-3 h-3" />
                    )}
                    {payment.status === "pending" && (
                      <FiClock className="w-3 h-3" />
                    )}
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Provider
                </label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {payment.provider.toUpperCase()}
                </p>
              </div>
              {payment.mpesa_transaction_id && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    M-Pesa Receipt Number
                  </label>
                  <p className="text-sm font-mono text-gray-900 mt-1 bg-white px-3 py-2 rounded border border-gray-200">
                    {payment.mpesa_transaction_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Details - Only show for failed payments */}
          {payment.status === "failed" && errorDetails && (
            <div className="bg-red-50 rounded-xl p-5 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-red-900">
                  Error Details
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-red-700 uppercase tracking-wide">
                    Error Code
                  </label>
                  <p className="text-sm font-mono font-semibold text-red-900 mt-1">
                    {errorDetails.code || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-red-700 uppercase tracking-wide">
                    Error Message
                  </label>
                  <p className="text-sm text-red-900 mt-1">
                    {errorDetails.message || "No error message available"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payer Information Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FiSearch className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Payer Information
              </h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Name
                </label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {payment.payer_name}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Phone Number
                </label>
                <p className="text-sm font-mono text-gray-900 mt-1">
                  {payment.payer_msisdn}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Account Number
                </label>
                <p className="text-sm font-mono text-gray-900 mt-1">
                  {payment.account_number}
                </p>
              </div>
            </div>
          </div>

          {/* Timing Information Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiClock className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Timing Information
              </h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Received At
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(payment.received_at).toLocaleDateString("en-KE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(payment.received_at).toLocaleTimeString("en-KE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Member Details - Only show if matched to subscription */}
          {payment.member && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiCheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900">
                  Member Details
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <p className="text-sm font-semibold text-blue-900 mt-1">
                    {payment.member.full_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <p className="text-sm font-mono text-blue-900 mt-1">
                    {payment.member.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Details - Only show if matched */}
          {payment.subscription?.plan && (
            <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiCheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-purple-900">
                  Subscription Details
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                    Insurance Plan
                  </label>
                  <p className="text-sm font-semibold text-purple-900 mt-1">
                    {payment.subscription.plan.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                    Coverage Amount
                  </label>
                  <p className="text-sm font-semibold text-purple-900 mt-1">
                    KShs{" "}
                    {payment.subscription.plan.coverage_amount.toLocaleString(
                      "en-KE"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {payment.status === "allocated" && (
            <button
              onClick={async () => {
                try {
                  await downloadPaymentReceipt(payment.id);
                } catch (error) {
                  console.error("Failed to download receipt:", error);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Download Receipt
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentsManagement;
