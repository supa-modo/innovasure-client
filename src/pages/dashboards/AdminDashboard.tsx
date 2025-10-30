import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import AdminLayout from "../../components/AdminLayout";
import StatCard from "../../components/ui/StatCard";
import DateRangeSelector from "../../components/admin/DateRangeSelector";
import BarChart from "../../components/admin/charts/BarChart";
import PieChart from "../../components/admin/charts/PieChart";
import AreaChart from "../../components/admin/charts/AreaChart";
import { getAdminDashboard } from "../../services/dashboardService";
import type { AdminDashboardData } from "../../services/dashboardService";
import {
  FaUsers,
  FaUserTie,
  FaChartLine,
  FaExclamationTriangle,
  FaMoneyCheckAlt,
} from "react-icons/fa";

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getAdminDashboard(selectedPeriod);
        setData(dashboardData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats || {
    totalMembers: 0,
    totalAgents: 0,
    totalSuperAgents: 0,
    activeSubscriptions: 0,
    pendingKYC: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingCommissions: 0,
    disbursedCommissions: 0,
  };

  // Prepare chart data
  const revenueChartData =
    data?.paymentTrends.map((item) => ({
      date: item.date,
      revenue: item.revenue,
      count: item.count,
    })) || [];

  const subscriptionChartData =
    data?.subscriptionsByPlan
      .filter((item: any) => item.plan && item.count > 0)
      .map((item: any) => ({
        name: item.plan.name || "Unknown",
        value: parseInt(item.count) || 0,
      })) || [];

  const topAgentsData =
    data?.topAgents
      .map((agent) => ({
        name: agent.name,
        count: agent.memberCount,
      }))
      .slice(0, 10) || [];

  return (
    <AdminLayout>
      <div className="space-y-6 ">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.profile?.full_name || "Admin"}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <DateRangeSelector
                onRangeChange={setSelectedPeriod}
                selectedDays={selectedPeriod}
              />
            </div>
          </div>
          <div className="border-t border-gray-200"></div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={
              loading
                ? "..."
                : `KShs. ${stats.totalRevenue.toLocaleString("en-KE")}`
            }
            gradient={
              loading
                ? ""
                : "bg-gradient-to-r from-secondary-600 via-secondary-700 to-primary-800"
            }
            subtitle={`KShs. ${stats.monthlyRevenue.toLocaleString("en-KE")} this month`}
            // trend="up"
            // trendValue={`+${Math.round((stats.monthlyRevenue / stats.totalRevenue) * 100)}%`}
          />
          <StatCard
            title="Total Members"
            value={loading ? "..." : stats.totalMembers.toLocaleString("en-KE")}
            icon={<FaUsers className="w-6 h-6" />}
            bgColor="bg-white"
          />
          <StatCard
            title="Active Agents"
            value={loading ? "..." : stats.totalAgents.toLocaleString("en-KE")}
            icon={<FaUserTie className="w-6 h-6" />}
            bgColor="bg-white"
          />
          <StatCard
            title="Pending KYC"
            value={loading ? "..." : stats.pendingKYC.toLocaleString("en-KE")}
            icon={<FaExclamationTriangle className="w-6 h-6" />}
            bgColor={stats.pendingKYC > 0 ? "bg-orange-50" : "bg-white"}
            textColor={
              stats.pendingKYC > 0 ? "text-orange-700" : "text-gray-900"
            }
          />
        </div>

        {/* Revenue Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Revenue Trends
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaChartLine className="text-blue-600" />
              <span>Last {selectedPeriod} days</span>
            </div>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <AreaChart
              data={revenueChartData}
              dataKey="revenue"
              color="#3B82F6"
              yAxisLabel="Revenue (KSh)"
            />
          )}
        </div>

        {/* Distribution, Agents & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Subscription Distribution
            </h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : subscriptionChartData.length > 0 ? (
              <PieChart data={subscriptionChartData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No subscriptions data available
              </div>
            )}
          </div>

          {/* Top Agents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Performing Agents
            </h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : topAgentsData.length > 0 ? (
              <BarChart
                data={topAgentsData}
                dataKey="count"
                color="#3B82F6"
                yAxisLabel="Members"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No agent data available
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data?.recentActivity.slice(0, 10).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-xl">
                      {activity.type === "member_registered" ? (
                        <FaUsers className="text-blue-600" />
                      ) : (
                        <FaMoneyCheckAlt className="text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === "member_registered"
                          ? "New member registered"
                          : "Payment received"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {activity.type === "member_registered"
                          ? `${activity.member_name} via ${activity.agent_code}`
                          : `KSh ${activity.amount?.toLocaleString("en-KE")} - ${String(activity.account_number)}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {data?.recentActivity.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No recent activity
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Active Subscriptions"
            value={
              loading
                ? "..."
                : stats.activeSubscriptions.toLocaleString("en-KE")
            }
            icon={<FaChartLine className="w-6 h-6" />}
            subtitle={`${stats.totalAgents} super agents`}
            bgColor="bg-white"
          />
          <StatCard
            title="Pending Commissions"
            value={
              loading
                ? "..."
                : `KSh ${stats.pendingCommissions.toLocaleString("en-KE")}`
            }
            icon={<FaMoneyCheckAlt className="w-6 h-6" />}
            bgColor="bg-white"
          />
          <StatCard
            title="Disbursed Commissions"
            value={
              loading
                ? "..."
                : `KSh ${stats.disbursedCommissions.toLocaleString("en-KE")}`
            }
            icon={<FaChartLine className="w-6 h-6" />}
            bgColor="bg-white"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
