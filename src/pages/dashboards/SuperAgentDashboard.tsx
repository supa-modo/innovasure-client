import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import RegisterAgentModal from "../../components/RegisterAgentModal";
import AgentDetailModal from "../../components/AgentDetailModal";
import {
  getSuperAgentDashboard,
  AgentPerformance,
} from "../../services/dashboardService";
import {
  FiUsers,
  FiUserCheck,
  FiTrendingUp,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { PiUsersDuotone } from "react-icons/pi";

const SuperAgentDashboard = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"compliance" | "members" | "commission">(
    "compliance"
  );
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentPerformance | null>(
    null
  );
  const [showAgentDetail, setShowAgentDetail] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getSuperAgentDashboard();
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
    return `KSh ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getFilteredAndSortedAgents = (): AgentPerformance[] => {
    if (!dashboardData?.agents) return [];

    let filtered = dashboardData.agents;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (agent: AgentPerformance) =>
          agent.name.toLowerCase().includes(query) ||
          agent.code.toLowerCase().includes(query) ||
          agent.phone.toLowerCase().includes(query)
      );
    }

    // Sort agents
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "compliance":
          return b.complianceRate - a.complianceRate;
        case "members":
          return b.memberCount - a.memberCount;
        case "commission":
          return b.commissionBalance - a.commissionBalance;
        default:
          return 0;
      }
    });

    return sorted;
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <DashboardLayout role="super_agent" user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredAgents = getFilteredAndSortedAgents();
  const stats = dashboardData?.stats || {};
  const superAgentInfo = dashboardData?.superAgentInfo || {};

  return (
    <DashboardLayout role="super_agent" user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-b-2xl bg-linear-to-br from-purple-600 via-purple-500 to-indigo-600 text-white shadow-lg p-6 md:p-8">
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
                  Super Agent Dashboard
                </h1>
                <div className="flex items-center gap-6">
                  <p className="text-purple-100 text-sm md:text-base">
                    {superAgentInfo.name} •{" "}
                    <span className="font-mono">{superAgentInfo.code}</span>
                  </p>

                  <button
                    onClick={() => navigate("/profile")}
                    className="underline underline-offset-4 text-sm text-amber-200 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    View Profile
                  </button>
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mx-2.5 lg:mx-3">
          <StatCard
            title="My Agents"
            value={stats.totalAgents || 0}
            subtitle="Active agents"
            icon={<PiUsersDuotone className="w-8 h-8 text-purple-600" />}
          />
          <StatCard
            title="Network Members"
            value={stats.totalMembers || 0}
            subtitle="Total members under agents"
            icon={<FiUserCheck className="w-8 h-8 text-blue-600" />}
          />
          <StatCard
            title="My Commission Balance"
            value={formatCurrency(stats.superAgentCommissionBalance || 0)}
            subtitle=" Pending payout"
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            // icon={<FiDollarSign className="w-6 h-6 text-white" />}
          />
          <StatCard
            title="Network Performance"
            value={`${stats.avgComplianceRate || 0}%`}
            subtitle="Average compliance rate"
            icon={<FiTrendingUp className="w-8 h-8 text-orange-600" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Agent Performance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[1.1rem] lg:text-lg font-bold text-primary-700">
                    Agent Performance ({filteredAgents.length})
                  </h2>
                </div>

                {/* Sort Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setSortBy("compliance")}
                    className={`px-4 py-1 md:py-2 rounded-full text-[0.8rem] lg:text-sm font-medium transition-colors ${
                      sortBy === "compliance"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200/60 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    By Compliance
                  </button>
                  <button
                    onClick={() => setSortBy("members")}
                    className={`px-4 py-1 md:py-2 rounded-full text-[0.8rem] lg:text-sm font-medium transition-colors ${
                      sortBy === "members"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200/60 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    By Members
                  </button>
                  <button
                    onClick={() => setSortBy("commission")}
                    className={`px-4 py-1 md:py-2 rounded-full text-[0.8rem] lg:text-sm font-medium transition-colors ${
                      sortBy === "commission"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200/60 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    By Commission
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search agents by name, code, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 input-field"
                  />
                </div>
              </div>

              {/* Agents List */}
              <div className="max-h-[600px] overflow-y-auto">
                {filteredAgents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No agents found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowAgentDetail(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {agent.name}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 font-mono">
                              {agent.code}
                            </p>
                            <p className="text-sm text-gray-500">
                              {agent.phone}
                            </p>
                          </div>
                          <StatusBadge
                            type="compliance"
                            complianceRate={agent.complianceRate}
                          />
                        </div>

                        {/* Agent Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Members
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {agent.memberCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Active Subs
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {agent.activeSubscriptions}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Commission
                            </p>
                            <p className="text-sm font-bold text-green-600">
                              {formatCurrency(agent.commissionBalance)}
                            </p>
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
            {/* Network Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-primary-700 mb-4">
                Network Overview
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-sm text-purple-700 font-medium mb-1">
                    Network Commission
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    {formatCurrency(stats.networkCommissionBalance || 0)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Total pending for all agents
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    Average Compliance
                  </p>
                  <p
                    className={`text-xl font-bold ${getComplianceColor(stats.avgComplianceRate || 0)}`}
                  >
                    {stats.avgComplianceRate || 0}%
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Network-wide payment compliance
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-3">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <FiUsers className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Register New Agent
                      </h3>
                      <p className="text-xs text-gray-600">
                        Add agent to your network
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Register Agent Modal */}
      <RegisterAgentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          // Refresh dashboard data after successful registration
          fetchDashboardData();
        }}
      />

      {/* Agent Detail Modal */}
      <AgentDetailModal
        isOpen={showAgentDetail}
        onClose={() => {
          setShowAgentDetail(false);
          setSelectedAgent(null);
        }}
        agent={selectedAgent}
      />
    </DashboardLayout>
  );
};

export default SuperAgentDashboard;
