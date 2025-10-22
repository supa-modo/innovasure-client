/**
 * Super Agents Management Page
 * Admin interface for managing super-agents
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import UserDetailsModal from "../../components/UserDetailsModal";
import { useAuthStore } from "../../store/authStore";
import {
  getSuperAgents,
  updateSuperAgentKYC,
  SuperAgent,
  SuperAgentFilters,
} from "../../services/superAgentsService";
import {
  FiSearch,
  FiDownload,
  FiEye,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";

const SuperAgentsManagement = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [superAgents, setSuperAgents] = useState<SuperAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User details modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  const [filters, setFilters] = useState<SuperAgentFilters>({
    page: 1,
    limit: 25,
    search: "",
    kyc_status: "",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    pages: 0,
  });

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Fetch super-agents
  const fetchSuperAgents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSuperAgents(filters);
      setSuperAgents(data.superAgents);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching super-agents:", err);
      setError(err.response?.data?.error || "Failed to fetch super-agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAgents();
  }, [filters]);

  // Handle opening user details modal
  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserDetailsOpen(true);
  };

  // Handle closing user details modal
  const handleCloseUserDetails = () => {
    setIsUserDetailsOpen(false);
    setSelectedUserId(null);
  };

  // Get KYC badge
  const getKYCBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      pending: {
        icon: FiClock,
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending",
      },
      approved: {
        icon: FiCheckCircle,
        color: "bg-green-100 text-green-800",
        text: "Approved",
      },
      rejected: {
        icon: FiXCircle,
        color: "bg-red-100 text-red-800",
        text: "Rejected",
      },
      flagged: {
        icon: FiAlertCircle,
        color: "bg-orange-100 text-orange-800",
        text: "Flagged",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  // Quick KYC action
  const handleQuickKYCAction = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await updateSuperAgentKYC(id, status);
      fetchSuperAgents();
    } catch (err: any) {
      console.error("Error updating KYC:", err);
      alert(err.response?.data?.error || "Failed to update KYC status");
    }
  };

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Super Agents Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage super-agent accounts and networks
            </p>
          </div>
          <button className="btn-primary">+ Add Super Agent</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-gray-600">Total Super Agents</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {pagination.total}
            </div>
          </div>
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-800">Total Agents</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {superAgents.reduce((sum, sa) => sum + (sa.agentCount || 0), 0)}
            </div>
          </div>
          <div className="card bg-green-50 border-green-200">
            <div className="text-sm text-green-800">Total Members</div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {superAgents.reduce((sum, sa) => sum + (sa.memberCount || 0), 0)}
            </div>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <div className="text-sm text-purple-800">Total Commissions</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">
              KES{" "}
              {superAgents
                .reduce((sum, sa) => sum + (sa.commissionBalance || 0), 0)
                .toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code, name, phone..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={filters.kyc_status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  kyc_status: e.target.value,
                  page: 1,
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All KYC Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <FiDownload />
              Export
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Super Agents Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">
                Loading super-agents...
              </span>
            </div>
          ) : superAgents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No super-agents found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Agents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        KYC Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {superAgents.map((sa) => (
                      <tr key={sa.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sa.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sa.user?.profile?.full_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {sa.user?.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4 text-gray-400" />
                            {sa.agentCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4 text-gray-400" />
                            {sa.memberCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiDollarSign className="w-4 h-4 text-gray-400" />
                            {(sa.commissionBalance || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getKYCBadge(sa.kyc_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(sa.user_id)}
                              className="text-primary-600 hover:text-primary-900"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            {sa.kyc_status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickKYCAction(sa.id, "approved")
                                  }
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <FiCheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickKYCAction(sa.id, "rejected")
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiXCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                    }
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                    }
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          userType="super_agent"
          isOpen={isUserDetailsOpen}
          onClose={handleCloseUserDetails}
        />
      )}
    </AdminLayout>
  );
};

export default SuperAgentsManagement;
