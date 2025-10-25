/**
 * Reports Page
 * Comprehensive reporting and analytics for payments, commissions, and settlements
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import {
  FiDownload,
  FiFilter,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiPieChart,
} from "react-icons/fi";
import { api } from "../../services/api";
import NotificationModal from "../../components/ui/NotificationModal";
import StatCard from "../../components/ui/StatCard";
import { PiUsersDuotone } from "react-icons/pi";

interface ReportData {
  summary: {
    total_revenue: number;
    total_payments: number;
    total_commissions: number;
    total_insurance: number;
    total_admin: number;
    payment_count: number;
    member_count: number;
    agent_count: number;
  };
  payment_trends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  commission_breakdown: Array<{
    beneficiary_type: string;
    total_amount: number;
    count: number;
  }>;
  top_agents: Array<{
    id: string;
    name: string;
    total_commission: number;
    payment_count: number;
  }>;
}

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<
    "payments" | "commissions" | "settlements" | "agents"
  >("payments");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">(
    "pdf"
  );

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
    fetchReportData();
  }, [reportType, dateFrom, dateTo]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: reportType,
        from: dateFrom,
        to: dateTo,
      });

      const response = await api.get(`/reports?${params.toString()}`);
      setReportData(response.data);
    } catch (error: any) {
      console.error("Failed to fetch report data:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to load report data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        from: dateFrom,
        to: dateTo,
        format: exportFormat,
      });

      const response = await api.get(`/reports/export?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${reportType}_report_${dateFrom}_to_${dateTo}.${exportFormat === "excel" ? "xlsx" : exportFormat}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "Report exported successfully",
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to export report",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive business insights and reports
            </p>
          </div>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e: any) => setReportType(e.target.value)}
                className="input-field"
              >
                <option value="payments">Payments Report</option>
                <option value="commissions">Commissions Report</option>
                <option value="settlements">Settlements Report</option>
                <option value="agents">Agent Performance</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field"
                max={dateTo}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field"
                min={dateFrom}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e: any) => setExportFormat(e.target.value)}
                className="input-field"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel (XLSX)</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : reportData ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Revenue"
                value={`KShs ${reportData.summary.total_revenue.toLocaleString()}`}
                subtitle={`${reportData.summary.payment_count} payments`}
                icon={<FiDollarSign className="w-4 h-4" />}
                trend="up"
                trendValue=""
              />
              <StatCard
                title="Total Commissions"
                value={`KShs ${reportData.summary.total_commissions.toLocaleString()}`}
                subtitle="Paid to agents"
                icon={<FiTrendingUp className="w-4 h-4" />}
                trend="up"
                trendValue=""
              />
              <StatCard
                title="Insurance Share"
                value={`KShs ${reportData.summary.total_insurance.toLocaleString()}`}
                subtitle="To be transferred"
                icon={<FiPieChart className="w-4 h-4" />}
                trend="neutral"
                trendValue=""
              />
              <StatCard
                title="Active Agents"
                value={reportData.summary.agent_count.toString()}
                subtitle={`${reportData.summary.member_count} members`}
                icon={<PiUsersDuotone className="w-4 h-4" />}
                trend="neutral"
                trendValue=""
              />
            </div>

            {/* Payment Trends */}
            {reportType === "payments" && reportData.payment_trends && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Payment Trends
                </h3>
                <div className="space-y-3">
                  {reportData.payment_trends.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(trend.date).toLocaleDateString("en-KE", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {trend.count} payments
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        KShs {trend.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commission Breakdown */}
            {reportType === "commissions" &&
              reportData.commission_breakdown && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Commission Breakdown
                  </h3>
                  <div className="space-y-3">
                    {reportData.commission_breakdown.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {item.beneficiary_type.replace("_", " ")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.count} transactions
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          KShs {item.total_amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Top Agents */}
            {reportType === "agents" && reportData.top_agents && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Top Performing Agents
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Agent Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Total Commission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Payments
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.top_agents.map((agent, index) => (
                        <tr key={agent.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                            #{index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {agent.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-300">
                            KShs {agent.total_commission.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {agent.payment_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Revenue Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Revenue Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Insurance Share
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      KShs {reportData.summary.total_insurance.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(
                        (reportData.summary.total_insurance /
                          reportData.summary.total_revenue) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Agent Commissions
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      KShs{" "}
                      {reportData.summary.total_commissions.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(
                        (reportData.summary.total_commissions /
                          reportData.summary.total_revenue) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Admin Share
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      KShs {reportData.summary.total_admin.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(
                        (reportData.summary.total_admin /
                          reportData.summary.total_revenue) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

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

export default ReportsPage;
