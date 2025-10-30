/**
 * Agents Management Page
 * Admin interface for managing agents
 */

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import AgentModal from "../../components/admin/AgentModal";
import UserManagementModal from "../../components/admin/UserManagementModal";
import NotificationModal from "../../components/ui/NotificationModal";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/ui/StatCard";
import {
  getAgents,
  updateAgentKYC,
  Agent,
  AgentFilters,
} from "../../services/agentsService";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
} from "react-icons/fi";
import { PiUsersDuotone, PiUsersThreeDuotone } from "react-icons/pi";

const AgentsManagement = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
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

  const [filters, setFilters] = useState<AgentFilters>({
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

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAgents(filters);
      setAgents(data.agents);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      setError(err.response?.data?.error || "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [filters]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  // Handle opening agent modal
  const handleViewAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsAgentModalOpen(true);
  };

  // Handle closing agent modal
  const handleCloseAgentModal = () => {
    setIsAgentModalOpen(false);
    setSelectedAgent(null);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Checkbox handlers
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(agents.map((agent) => agent.id));
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

  const isRowSelected = (row: Agent) => selectedRows.has(row.id);
  const isAllSelected =
    selectedRows.size === agents.length && agents.length > 0;

  // Get KYC status badge
  const getKYCBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      pending: {
        icon: FiClock,
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending",
      },
      under_review: {
        icon: FiAlertCircle,
        color: "bg-blue-100 text-blue-800",
        text: "Under Review",
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

  // Quick KYC action with NotificationModal
  const handleQuickKYCAction = (
    agent: Agent,
    status: "approved" | "rejected"
  ) => {
    setNotification({
      isOpen: true,
      type: status === "approved" ? "confirm" : "warning",
      title: status === "approved" ? "Approve KYC" : "Reject KYC",
      message:
        status === "approved"
          ? `Are you sure you want to approve KYC for ${agent.full_name || agent.code}?`
          : `Are you sure you want to reject KYC for ${agent.full_name || agent.code}?`,
      onConfirm: async () => {
        try {
          await updateAgentKYC(agent.id, status);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Updated",
            message: `Agent KYC has been ${status} successfully.`,
            onConfirm: undefined,
          });
          fetchAgents();
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
              Agents Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage agent accounts, KYC verification, and network
            </p>
          </div>
          <button
            onClick={() => setIsUserManagementModalOpen(true)}
            className="px-6 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            + Add Agent
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Agents"
            value={pagination.total}
            icon={<PiUsersDuotone className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Pending KYC"
            value={agents.filter((a) => a.kyc_status === "pending").length}
            icon={<FiClock className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Active"
            value={agents.filter((a) => a.user?.status === "active").length}
            icon={<FiCheckCircle className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Total Members"
            value={agents.reduce((sum, a) => sum + (a.memberCount || 0), 0)}
            icon={<PiUsersThreeDuotone className="w-10 h-10" />}
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
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

        {/* Agents Table */}
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
                cell: (row: Agent) => row.full_name || "N/A",
              },
              {
                id: "phone",
                header: "Phone",
                cell: (row: Agent) => (
                  <span className="font-lexend tracking-wide">{row.user?.phone || "-"}</span>
                ),
              },
              {
                id: "super_agent",
                header: "Super Agent",
                cell: (row: Agent) =>
                  row.super_agent?.full_name  || "None",
              },
              {
                id: "members",
                header: "Members",
                cell: (row: Agent) => (
                  <div className="flex items-center gap-2 font-lexend font-semibold">
                    <PiUsersThreeDuotone className="w-4 h-4 text-gray-400" />
                    <span>{row.memberCount || 0}</span>
                  </div>
                ),
              },
              {
                id: "commission",
                header: "Commission",
                cell: (row: Agent) => (
                  <div className="font-lexend font-semibold">
                    <span>
                      KShs. {(row.commissionBalance || 0).toLocaleString()}
                    </span>
                  </div>
                ),
              },
              {
                id: "kyc_status",
                header: "KYC Status",
                cell: (row: Agent) => getKYCBadge(row.kyc_status),
              },
              {
                id: "actions",
                header: "Actions",
                cell: (row: Agent) => (
                  <div className="flex items-center justify-start gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAgent(row);
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
                          className="p-2 text-green-600 hover:bg-green-50 underline underline-offset-4 rounded-lg transition-colors"
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickKYCAction(row, "rejected");
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 underline underline-offset-4 rounded-lg transition-colors"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            rows={agents}
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
            onRowClick={handleViewAgent}
            getRowId={(agent: Agent) => agent.id}
            isAllSelected={isAllSelected}
            onToggleAll={handleToggleAll}
            isRowSelected={isRowSelected}
            onToggleRow={handleToggleRow}
          />
        </div>
      </div>

      {/* Agent Modal */}
      {selectedAgent && (
        <AgentModal
          isOpen={isAgentModalOpen}
          onClose={handleCloseAgentModal}
          agent={selectedAgent}
          onUpdate={fetchAgents}
        />
      )}

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        userType="agent"
        mode="add"
        onSave={() => {
          fetchAgents();
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

export default AgentsManagement;
