/**
 * Members Management Page
 * Admin interface for managing members
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import MemberModal from "../../components/admin/MemberModal";
import UserManagementModal from "../../components/admin/UserManagementModal";
import NotificationModal from "../../components/ui/NotificationModal";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/ui/StatCard";
import { useAuthStore } from "../../store/authStore";
import {
  getMembers,
  updateKYCStatus,
  Member,
  MemberFilters,
} from "../../services/membersService";
import {
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiDownload,
} from "react-icons/fi";
import { PiUsersThreeDuotone } from "react-icons/pi";

const MembersManagement = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

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

  // Handle opening member modal
  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  };

  // Handle closing member modal
  const handleCloseMemberModal = () => {
    setIsMemberModalOpen(false);
    setSelectedMember(null);
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

  // Checkbox handlers
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(members.map((member) => member.id));
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

  const isRowSelected = (row: Member) => selectedRows.has(row.id);
  const isAllSelected =
    selectedRows.size === members.length && members.length > 0;

  // Quick KYC approve/reject with NotificationModal
  const handleQuickKYCAction = (
    member: Member,
    status: "approved" | "rejected"
  ) => {
    setNotification({
      isOpen: true,
      type: status === "approved" ? "confirm" : "warning",
      title: status === "approved" ? "Approve KYC" : "Reject KYC",
      message:
        status === "approved"
          ? `Are you sure you want to approve KYC for ${member.full_name}?`
          : `Are you sure you want to reject KYC for ${member.full_name}?`,
      onConfirm: async () => {
        try {
          await updateKYCStatus(member.id, status);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Updated",
            message: `Member KYC has been ${status} successfully.`,
            onConfirm: undefined,
          });
          fetchMembers();
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
              Members Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage member accounts, KYC verification, and profiles
            </p>
          </div>
          <button
            onClick={() => setIsUserManagementModalOpen(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            + Add Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={pagination.total}
            icon={<PiUsersThreeDuotone className="w-10 h-10" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Pending KYC"
            value={members.filter((m) => m.kyc_status === "pending").length}
            icon={<FiClock className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Approved"
            value={members.filter((m) => m.kyc_status === "approved").length}
            icon={<FiCheckCircle className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Rejected"
            value={members.filter((m) => m.kyc_status === "rejected").length}
            icon={<FiXCircle className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable
            columns={[
              {
                id: "account_number",
                header: "Account Number",
                accessor: "account_number",
                headerClassName: "font-mono",
              },
              {
                id: "full_name",
                header: "Full Name",
                accessor: "full_name",
              },
              {
                id: "phone",
                header: "Phone",
                accessor: "phone",
              },
              {
                id: "agent",
                header: "Agent",
                cell: (row: Member) =>
                  row.agent?.user?.profile?.full_name || "N/A",
              },
              {
                id: "kyc_status",
                header: "KYC Status",
                cell: (row: Member) => getKYCBadge(row.kyc_status),
              },
              {
                id: "created_at",
                header: "Registered",
                cell: (row: Member) =>
                  new Date(row.created_at).toLocaleDateString(),
              },
              {
                id: "actions",
                header: "Actions",
                cell: (row: Member) => (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMember(row);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {row.kyc_status === "pending" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickKYCAction(row, "approved");
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve KYC"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickKYCAction(row, "rejected");
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject KYC"
                        >
                          <FiXCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            rows={members}
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
            onRowClick={handleViewMember}
            getRowId={(member: Member) => member.id}
            isAllSelected={isAllSelected}
            onToggleAll={handleToggleAll}
            isRowSelected={isRowSelected}
            onToggleRow={handleToggleRow}
          />
        </div>
      </div>

      {/* Member Modal */}
      {selectedMember && (
        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={handleCloseMemberModal}
          member={selectedMember}
          onUpdate={fetchMembers}
        />
      )}

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        userType="member"
        mode="add"
        onSave={() => {
          fetchMembers();
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

export default MembersManagement;
