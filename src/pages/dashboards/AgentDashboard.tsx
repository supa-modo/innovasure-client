import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import RegisterMemberModal from "../../components/RegisterMemberModal";
import {
  getAgentDashboard,
  MemberWithStatus,
} from "../../services/dashboardService";
import {
  FiUsers,
  FiCheckCircle,
  FiDollarSign,
  FiTrendingUp,
  FiSearch,
  FiRefreshCw,
  FiUser,
  FiCalendar,
} from "react-icons/fi";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "due_today" | "overdue">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getAgentDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFilteredMembers = (): MemberWithStatus[] => {
    if (!dashboardData?.members) return [];

    let filtered = dashboardData.members;

    // Apply payment status filter
    if (filter !== "all") {
      filtered = filtered.filter(
        (m: MemberWithStatus) => m.paymentStatus === filter
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m: MemberWithStatus) =>
          m.full_name.toLowerCase().includes(query) ||
          m.account_number.toLowerCase().includes(query) ||
          m.phone.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <DashboardLayout role="agent" user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredMembers = getFilteredMembers();
  const stats = dashboardData?.stats || {};
  const agentInfo = dashboardData?.agentInfo || {};

  return (
    <DashboardLayout role="agent" user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-b-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg p-6 md:p-8">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('/bg1.jpg')`,
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Agent Dashboard
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  {agentInfo.name} •{" "}
                  <span className="font-mono">{agentInfo.code}</span>
                </p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                title="Refresh dashboard"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Members"
            value={stats.totalMembers || 0}
            subtitle="Registered members"
            icon={<FiUsers className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions || 0}
            subtitle="Active policies"
            icon={<FiCheckCircle className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Commission Balance"
            value={formatCurrency(stats.commissionBalance || 0)}
            subtitle="Pending payout"
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            icon={<FiDollarSign className="w-6 h-6 text-white" />}
          />
          <StatCard
            title="Today's Earnings"
            value={formatCurrency(stats.todaysCommissions || 0)}
            subtitle="Commissions earned today"
            icon={<FiTrendingUp className="w-6 h-6 text-orange-600" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-primary-700">
                    My Members ({filteredMembers.length})
                  </h2>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("due_today")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "due_today"
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Due Today
                  </button>
                  <button
                    onClick={() => setFilter("overdue")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "overdue"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Overdue
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, account, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Members List */}
              <div className="max-h-[600px] overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No members found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/members/${member.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {member.full_name}
                              </p>
                              <StatusBadge
                                type="payment"
                                status={member.paymentStatus}
                              />
                            </div>
                            <p className="text-sm text-gray-600 font-mono">
                              {member.account_number}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.phone}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            {member.subscription ? (
                              <>
                                <p className="text-xs text-gray-500 mb-1">
                                  {member.subscription.plan?.name}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  KSh {member.subscription.plan?.premium_amount}
                                  /
                                  {member.subscription.plan
                                    ?.premium_frequency || "period"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Due:{" "}
                                  {formatDate(
                                    member.subscription.next_due_date
                                  )}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-500">
                                No active plan
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Commissions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-primary-700 mb-4">
                Recent Commissions
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {dashboardData?.recentCommissions?.length > 0 ? (
                  dashboardData.recentCommissions.map((commission: any) => (
                    <div
                      key={commission.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {commission.member_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(commission.date)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-green-600 ml-2">
                          +{formatCurrency(commission.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent commissions
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-primary-700 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FiUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Register New Member
                      </h3>
                      <p className="text-xs text-gray-600">
                        Add member to your portfolio
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FiCalendar className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        View Profile
                      </h3>
                      <p className="text-xs text-gray-600">
                        Manage your information
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Register Member Modal */}
      <RegisterMemberModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          // Refresh dashboard data after successful registration
          fetchDashboardData();
        }}
      />
    </DashboardLayout>
  );
};

export default AgentDashboard;
