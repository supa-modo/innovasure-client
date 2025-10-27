import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  FiActivity,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiClock,
  FiServer,
  FiTrendingUp,
} from "react-icons/fi";
import { TbActivity } from "react-icons/tb";
import {
  getSystemHealth,
  getSystemMetrics,
  getDatabaseStats,
  getQueueStats,
  getApplicationMetrics,
  SystemHealth,
  SystemMetrics,
  DatabaseStats,
  QueueStats,
  ApplicationMetrics,
} from "../../services/systemService";
import OverviewTab from "../../components/admin/system/OverviewTab";
import HealthChecksTab from "../../components/admin/system/HealthChecksTab";
import MetricsTab from "../../components/admin/system/MetricsTab";
import QueueMonitorTab from "../../components/admin/system/QueueMonitorTab";
import SystemActionsTab from "../../components/admin/system/SystemActionsTab";

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [metricsData, setMetricsData] = useState<SystemMetrics | null>(null);
  const [databaseData, setDatabaseData] = useState<DatabaseStats | null>(null);
  const [queueData, setQueueData] = useState<QueueStats | null>(null);
  const [applicationData, setApplicationData] =
    useState<ApplicationMetrics | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [health, metrics, database, queues, application] =
        await Promise.all([
          getSystemHealth(),
          getSystemMetrics(),
          getDatabaseStats(),
          getQueueStats(),
          getApplicationMetrics(),
        ]);

      setHealthData(health);
      setMetricsData(metrics);
      setDatabaseData(database);
      setQueueData(queues);
      setApplicationData(application);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching system data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "degraded":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case "degraded":
        return <FiAlertCircle className="w-5 h-5 text-yellow-600" />;
      case "critical":
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiActivity className="w-5 h-5 text-gray-600" />;
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FiActivity },
    { id: "health", label: "Health Checks", icon: FiCheckCircle },
    { id: "metrics", label: "Performance Metrics", icon: FiTrendingUp },
    { id: "queues", label: "Queue Monitor", icon: TbActivity },
    { id: "actions", label: "System Actions", icon: FiServer },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Monitor</h1>
            <p className="text-gray-600 mt-1">
              Monitor system health, performance, and manage system operations
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Overall Status */}
            {healthData && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(
                  healthData.status
                )}`}
              >
                {getStatusIcon(healthData.status)}
                <span className="font-semibold text-sm capitalize">
                  {healthData.status}
                </span>
              </div>
            )}

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                autoRefresh
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiClock className="inline mr-2" size={16} />
              {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiRefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Last Refresh Time */}
        <div className="text-sm text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {loading && !healthData ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {activeTab === "overview" && (
              <OverviewTab
                healthData={healthData}
                metricsData={metricsData}
                databaseData={databaseData}
                applicationData={applicationData}
              />
            )}
            {activeTab === "health" && (
              <HealthChecksTab healthData={healthData} />
            )}
            {activeTab === "metrics" && (
              <MetricsTab metricsData={metricsData} />
            )}
            {activeTab === "queues" && (
              <QueueMonitorTab
                queueData={queueData}
                metricsData={metricsData}
              />
            )}
            {activeTab === "actions" && (
              <SystemActionsTab onRefresh={fetchAllData} />
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SystemManagement;
