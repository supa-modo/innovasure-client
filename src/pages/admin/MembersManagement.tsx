/**
 * Members Management Page
 * Admin interface for managing members
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import UserDetailsModal from "../../components/UserDetailsModal";
import { useAuthStore } from "../../store/authStore";
import {
  getMembers,
  updateKYCStatus,
  Member,
  MemberFilters,
} from "../../services/membersService";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

const MembersManagement = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User details modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  const [filters, setFilters] = useState<MemberFilters>({
    page: 1,
    limit: 25,
    search: "",
    kyc_status: "",
    sort_by: "created_at",
    sort_order: "DESC",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    pages: 0,
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Fetch members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMembers(filters);
      setMembers(data.members);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching members:", err);
      setError(err.response?.data?.error || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [filters]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  // Handle KYC status filter
  const handleKYCFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, kyc_status: status, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

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
  const getKYCBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      pending: {
        icon: FiClock,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Pending",
      },
      under_review: {
        icon: FiAlertCircle,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        text: "Under Review",
      },
      approved: {
        icon: FiCheckCircle,
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Approved",
      },
      rejected: {
        icon: FiXCircle,
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Rejected",
      },
      flagged: {
        icon: FiAlertCircle,
        color: "bg-orange-100 text-orange-800 border-orange-200",
        text: "Flagged",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  // Quick KYC approve/reject
  const handleQuickKYCAction = async (
    memberId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await updateKYCStatus(memberId, status);
      fetchMembers(); // Refresh list
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
              Members Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage member accounts, KYC verification, and profiles
            </p>
          </div>
          <button
            onClick={() => {
              /* TODO: Open create member modal */
            }}
            className="btn-primary"
          >
            + Add Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-gray-600">Total Members</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {pagination.total}
            </div>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="text-sm text-yellow-800">Pending KYC</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">
              {members.filter((m) => m.kyc_status === "pending").length}
            </div>
          </div>
          <div className="card bg-green-50 border-green-200">
            <div className="text-sm text-green-800">Approved</div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {members.filter((m) => m.kyc_status === "approved").length}
            </div>
          </div>
          <div className="card bg-red-50 border-red-200">
            <div className="text-sm text-red-800">Rejected</div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {members.filter((m) => m.kyc_status === "rejected").length}
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="card">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, account number..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* KYC Status Filter */}
            <select
              value={filters.kyc_status}
              onChange={(e) => handleKYCFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All KYC Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>

            {/* More Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <FiFilter />
              Filters
            </button>

            {/* Export */}
            <button className="btn-secondary flex items-center gap-2">
              <FiDownload />
              Export
            </button>
          </div>

          {/* Advanced Filters (Expandable) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
              {/* Date filters, agent filter, etc. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={filters.from_date || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      from_date: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={filters.to_date || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      to_date: e.target.value,
                      page: 1,
                    }))
                  }
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() =>
                    setFilters({
                      page: 1,
                      limit: 25,
                      search: "",
                      kyc_status: "",
                      sort_by: "created_at",
                      sort_order: "DESC",
                    })
                  }
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Members Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading members...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No members found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KYC Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.account_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {member.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {member.agent?.user?.profile?.full_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getKYCBadge(member.kyc_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(member.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                member.user_id &&
                                handleViewDetails(member.user_id)
                              }
                              className="text-primary-600 hover:text-primary-900"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                console.log("Edit member:", member.id)
                              }
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            {member.kyc_status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickKYCAction(member.id, "approved")
                                  }
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve KYC"
                                >
                                  <FiCheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickKYCAction(member.id, "rejected")
                                  }
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject KYC"
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
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
          userType="member"
          isOpen={isUserDetailsOpen}
          onClose={handleCloseUserDetails}
        />
      )}
    </AdminLayout>
  );
};

export default MembersManagement;
