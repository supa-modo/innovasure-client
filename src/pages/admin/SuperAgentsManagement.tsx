/**
 * Super Agents Management Page
 * Admin interface for managing super-agents
 */

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import SuperAgentModal from "../../components/admin/SuperAgentModal";
import UserManagementModal from "../../components/admin/UserManagementModal";
import NotificationModal from "../../components/ui/NotificationModal";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/ui/StatCard";
import {
  getSuperAgents,
  updateSuperAgentKYC,
  SuperAgent,
  SuperAgentFilters,
} from "../../services/superAgentsService";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
  FiShield,
  FiSearch,
} from "react-icons/fi";
import { PiUsersDuotone, PiUsersThreeDuotone } from "react-icons/pi";

const SuperAgentsManagement = () => {
  const [superAgents, setSuperAgents] = useState<SuperAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [selectedSuperAgent, setSelectedSuperAgent] =
    useState<SuperAgent | null>(null);
  const [isSuperAgentModalOpen, setIsSuperAgentModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] =
    useState(false);

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
    onConfirm: undefined as (() => void) | undefined,
  });

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

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

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

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  // Handle opening super-agent modal
  const handleViewSuperAgent = (superAgent: SuperAgent) => {
    setSelectedSuperAgent(superAgent);
    setIsSuperAgentModalOpen(true);
  };

  // Handle closing super-agent modal
  const handleCloseSuperAgentModal = () => {
    setIsSuperAgentModalOpen(false);
    setSelectedSuperAgent(null);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Checkbox handlers
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(superAgents.map((superAgent) => superAgent.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleToggleRow = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  const isRowSelected = (row: SuperAgent) => selectedRows.has(row.id);
  const isAllSelected =
    selectedRows.size === superAgents.length && superAgents.length > 0;

  // Get KYC badge
  const getKYCBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      pending: {
        icon: FiClock,
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        text: "Pending",
      },
      approved: {
        icon: FiCheckCircle,
        color: "bg-green-100 text-green-800 border-green-300",
        text: "Approved",
      },
      rejected: {
        icon: FiXCircle,
        color: "bg-red-100 text-red-800 border-red-300",
        text: "Rejected",
      },
      flagged: {
        icon: FiAlertCircle,
        color: "bg-orange-100 text-orange-800 border-orange-300",
        text: "Flagged",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 border rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  // Quick KYC action with NotificationModal
  const handleQuickKYCAction = (
    superAgent: SuperAgent,
    status: "approved" | "rejected"
  ) => {
    setNotification({
      isOpen: true,
      type: status === "approved" ? "confirm" : "warning",
      title: status === "approved" ? "Approve KYC" : "Reject KYC",
      message:
        status === "approved"
          ? `Are you sure you want to approve KYC for ${superAgent.full_name || superAgent.code}?`
          : `Are you sure you want to reject KYC for ${superAgent.full_name || superAgent.code}?`,
      onConfirm: async () => {
        try {
          await updateSuperAgentKYC(superAgent.id, status);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Updated",
            message: `Super-agent KYC has been ${status} successfully.`,
            onConfirm: undefined,
          });
          fetchSuperAgents();
        } catch (err: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Update Failed",
            message:
              err.response?.data?.error || "Failed to update KYC status.",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  return (
    <AdminLayout>
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
          <button
            onClick={() => setIsUserManagementModalOpen(true)}
            className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            + Add Super Agent
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Super Agents"
            value={pagination.total}
            icon={<FiShield className="w-8 h-8" />}
          />
          <StatCard
            title="Total Agents"
            value={superAgents.reduce(
              (sum, sa) => sum + (sa.agentCount || 0),
              0
            )}
            icon={<PiUsersDuotone className="w-8 h-8" />}
          />
          <StatCard
            title="Total Members"
            value={superAgents.reduce(
              (sum, sa) => sum + (sa.memberCount || 0),
              0
            )}
            icon={<PiUsersThreeDuotone className="w-10 h-10" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Total Commissions"
            value={`KSh ${superAgents.reduce((sum, sa) => sum + (sa.commissionBalance || 0), 0).toLocaleString()}`}
            icon={<FiDollarSign className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by code, name, phone..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">All KYC Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Super Agents Table */}
        <div className="bg-white rounded-2xl shadow-sm border  overflow-hidden">
          <DataTable
            columns={[
              {
                id: "code",
                header: "Code",
                accessor: "code",
                headerClassName: "font-mono",
              },
              {
                id: "name",
                header: "Name",
                cell: (row: SuperAgent) => row.full_name || "N/A",
              },
              {
                id: "phone",
                header: "Phone",
                cell: (row: SuperAgent) => (
                  <span className="font-lexend tracking-wide text-gray-600">
                    {row.user?.phone || "-"}
                  </span>
                ),
              },
              {
                id: "agents",
                header: "Agents",
                cell: (row: SuperAgent) => (
                  <div className="flex items-center gap-2 font-lexend font-semibold">
                    <PiUsersDuotone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800">{row.agentCount || 0}</span>
                  </div>
                ),
              },
              {
                id: "members",
                header: "Members",
                cell: (row: SuperAgent) => (
                  <div className="flex items-center gap-4 font-lexend font-semibold">
                    <PiUsersThreeDuotone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800">
                      {row.memberCount || 0}
                    </span>
                  </div>
                ),
              },
              {
                id: "commission",
                header: "Commission",
                cell: (row: SuperAgent) => (
                  <div className="flex items-center gap-2 font-lexend font-semibold">
                    <span>
                      KShs. {(row.commissionBalance || 0).toLocaleString()}
                    </span>
                  </div>
                ),
              },
              {
                id: "kyc_status",
                header: "KYC Status",
                cell: (row: SuperAgent) => getKYCBadge(row.kyc_status),
              },
              {
                id: "actions",
                header: "Actions",
                cell: (row: SuperAgent) => (
                  <div className="flex items-center justify-start gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSuperAgent(row);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 underline underline-offset-4 rounded-lg transition-colors"
                      title="View Details"
                    >
                      View Details
                    </button>
                    {row.kyc_status === "pending" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickKYCAction(row, "approved");
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickKYCAction(row, "rejected");
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            rows={superAgents}
            totalItems={pagination.total}
            startIndex={(pagination.page - 1) * pagination.limit + 1}
            endIndex={Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )}
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            tableLoading={loading}
            hasSearched={!!filters.search}
            onRowClick={handleViewSuperAgent}
            getRowId={(superAgent: SuperAgent) => superAgent.id}
            isAllSelected={isAllSelected}
            onToggleAll={handleToggleAll}
            isRowSelected={isRowSelected}
            onToggleRow={handleToggleRow}
          />
        </div>
      </div>

      {/* Super Agent Modal */}
      {selectedSuperAgent && (
        <SuperAgentModal
          isOpen={isSuperAgentModalOpen}
          onClose={handleCloseSuperAgentModal}
          superAgent={selectedSuperAgent}
          onUpdate={fetchSuperAgents}
        />
      )}

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        userType="super_agent"
        mode="add"
        onSave={() => {
          fetchSuperAgents();
          setIsUserManagementModalOpen(false);
        }}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </AdminLayout>
  );
};

export default SuperAgentsManagement;
