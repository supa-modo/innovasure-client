/**
 * KYC Management Page
 * Centralized KYC review queue
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useAuthStore } from "../../store/authStore";
import {
  getKYCQueue,
  approveKYC,
  rejectKYC,
  flagKYC,
  KYCQueueItem,
  KYCFilters,
} from "../../services/kycService";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiEye,
  FiUser,
  FiUsers,
  FiShield,
} from "react-icons/fi";

const KYCManagement = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [queue, setQueue] = useState<KYCQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<KYCFilters>({
    type: "all",
    status: "pending",
    page: 1,
    limit: 50,
  });

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Fetch KYC queue
  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getKYCQueue(filters);
      setQueue(data.queue);
    } catch (err: any) {
      console.error("Error fetching KYC queue:", err);
      setError(err.response?.data?.error || "Failed to fetch KYC queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [filters]);

  // Get entity type icon and color
  const getEntityBadge = (type: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      member: {
        icon: FiUser,
        color: "bg-blue-100 text-blue-800",
        text: "Member",
      },
      agent: {
        icon: FiUsers,
        color: "bg-green-100 text-green-800",
        text: "Agent",
      },
      super_agent: {
        icon: FiShield,
        color: "bg-purple-100 text-purple-800",
        text: "Super Agent",
      },
    };

    const badge = badges[type] || badges.member;
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

  // Handle approve
  const handleApprove = async (item: KYCQueueItem) => {
    if (
      window.confirm(
        `Approve KYC for ${item.user?.profile?.full_name || "this applicant"}?`
      )
    ) {
      try {
        await approveKYC(item.entityType, item.id);
        fetchQueue();
      } catch (err: any) {
        alert(err.response?.data?.error || "Failed to approve KYC");
      }
    }
  };

  // Handle reject
  const handleReject = async (item: KYCQueueItem) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectKYC(item.entityType, item.id, reason);
        fetchQueue();
      } catch (err: any) {
        alert(err.response?.data?.error || "Failed to reject KYC");
      }
    }
  };

  // Handle flag
  const handleFlag = async (item: KYCQueueItem) => {
    const reason = prompt("Enter flag reason:");
    if (reason) {
      try {
        await flagKYC(item.entityType, item.id, reason);
        fetchQueue();
      } catch (err: any) {
        alert(err.response?.data?.error || "Failed to flag KYC");
      }
    }
  };

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Review Queue</h1>
          <p className="text-gray-600 mt-1">
            Review and approve KYC applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="text-sm text-yellow-800">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">
              {queue.filter((q) => q.kyc_status === "pending").length}
            </div>
          </div>
          <div className="card bg-blue-100 border-blue-200">
            <div className="text-sm text-blue-800">Members</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {queue.filter((q) => q.entityType === "member").length}
            </div>
          </div>
          <div className="card bg-green-100 border-green-200">
            <div className="text-sm text-green-800">Agents</div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {queue.filter((q) => q.entityType === "agent").length}
            </div>
          </div>
          <div className="card bg-purple-100 border-purple-200">
            <div className="text-sm text-purple-800">Super Agents</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">
              {queue.filter((q) => q.entityType === "super_agent").length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Type:
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  type: e.target.value as any,
                  page: 1,
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="member">Members</option>
              <option value="agent">Agents</option>
              <option value="super_agent">Super Agents</option>
            </select>

            <label className="text-sm font-medium text-gray-700 ml-4">
              Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                  page: 1,
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* KYC Queue Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading KYC queue...</span>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No applications in queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Code/Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queue.map((item) => (
                    <tr
                      key={`${item.entityType}-${item.id}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEntityBadge(item.entityType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.user?.profile?.full_name ||
                          item.full_name ||
                          "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.user?.phone || item.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(item as any).code ||
                          (item as any).account_number ||
                          "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.kyc_documents?.length || 0} files
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(item)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFlag(item)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Flag for Review"
                          >
                            <FiAlertCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default KYCManagement;
