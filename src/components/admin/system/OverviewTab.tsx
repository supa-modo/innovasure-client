import React from "react";
import { FiDatabase, FiServer, FiZap, FiMessageSquare } from "react-icons/fi";
import { TbActivity, TbCreditCard } from "react-icons/tb";
import {
  SystemHealth,
  SystemMetrics,
  DatabaseStats,
  ApplicationMetrics,
} from "../../../services/systemService";

interface OverviewTabProps {
  healthData: SystemHealth | null;
  metricsData: SystemMetrics | null;
  databaseData: DatabaseStats | null;
  applicationData: ApplicationMetrics | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  healthData,
  metricsData,
  databaseData,
  applicationData,
}) => {
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      healthy: "bg-green-100 text-green-800 border-green-300",
      degraded: "bg-yellow-100 text-yellow-800 border-yellow-300",
      critical: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* System Health Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthData &&
            Object.entries(healthData.services).map(([key, service]) => (
              <div
                key={key}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 capitalize">
                    {key}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(
                      service.status
                    )}`}
                  >
                    {service.status}
                  </span>
                </div>
                {"responseTime" in service && service.responseTime && (
                  <p className="text-sm text-gray-600">
                    Response time: {service.responseTime}ms
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Uptime */}
          {metricsData && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between mb-2">
                <FiServer className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">
                  {metricsData.system.uptime.formatted}
                </span>
              </div>
              <p className="text-sm text-gray-700">System Uptime</p>
            </div>
          )}

          {/* Memory Usage */}
          {metricsData && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between mb-2">
                <FiZap className="w-6 h-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-900">
                  {metricsData.system.memory.percentage}%
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">Memory Usage</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${metricsData.system.memory.percentage}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formatBytes(metricsData.system.memory.used)} /{" "}
                {formatBytes(metricsData.system.memory.total)}
              </p>
            </div>
          )}

          {/* CPU Usage */}
          {metricsData && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between mb-2">
                <TbActivity className="w-6 h-6 text-orange-600" />
                <span className="text-2xl font-bold text-orange-900">
                  {metricsData.system.cpu.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-700">CPU Load (1m avg)</p>
            </div>
          )}

          {/* Queue Jobs */}
          {metricsData && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between mb-2">
                <TbActivity className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-900">
                  {Object.values(metricsData.queues).reduce(
                    (sum, queue) =>
                      sum + (queue.waiting || 0) + (queue.active || 0),
                    0
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-700">Active Queue Jobs</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Payments Processed */}
          {applicationData && (
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <TbCreditCard className="w-6 h-6 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {applicationData.payments.today}
                </span>
              </div>
              <p className="text-sm text-gray-600">Payments Processed Today</p>
            </div>
          )}

          {/* Active Subscriptions */}
          {databaseData && (
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <FiDatabase className="w-6 h-6 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {databaseData.counts.activeSubscriptions}
                </span>
              </div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
            </div>
          )}

          {/* Pending Payments */}
          {databaseData && (
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <TbCreditCard className="w-6 h-6 text-yellow-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {databaseData.counts.pendingPayments}
                </span>
              </div>
              <p className="text-sm text-gray-600">Pending Payments</p>
            </div>
          )}

          {/* Success Rate */}
          {applicationData && (
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <FiMessageSquare className="w-6 h-6 text-purple-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {applicationData.payments.successRate}%
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Payment Success Rate (24h)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
