/**
 * KYC Management Page
 * Centralized KYC review queue
 */

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/ui/StatCard";
import KYCReviewModal from "../../components/admin/KYCReviewModal";
import NotificationModal from "../../components/ui/NotificationModal";
import {
  getKYCQueue,
  approveKYC,
  rejectKYC,
  flagKYC,
  getKYCById,
  KYCQueueItem,
  KYCFilters,
} from "../../services/kycService";
import { FiUser, FiClock } from "react-icons/fi";
import {
  PiUserDuotone,
  PiUsersDuotone,
  PiUsersThreeDuotone,
} from "react-icons/pi";
import { RiUserStarLine } from "react-icons/ri";
import { formatDate } from "@/components/helpers/formatDate";

const KYCManagement = () => {
  const [queue, setQueue] = useState<KYCQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState<KYCFilters>({
    type: "all",
    status: "pending,under_review", // Include both pending and under_review
    page: 1,
    limit: 50,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [entityType, setEntityType] = useState<
    "member" | "agent" | "super_agent" | null
  >(null);
  const [loadingEntity, setLoadingEntity] = useState(false);

  // Notification modal state
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    type: "confirm" | "error" | "success";
    title: string;
    message: string;
    action?: "approve" | "reject" | "flag";
    item?: KYCQueueItem;
    reason?: string;
  }>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
  });
  const [reasonInput, setReasonInput] = useState("");

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
        icon: PiUsersDuotone,
        color: "bg-green-100 text-green-800",
        text: "Agent",
      },
      super_agent: {
        icon: RiUserStarLine,
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
  const handleApprove = (item: KYCQueueItem) => {
    const displayName =
      item.full_name ||
      (item.entityType === "member" ? item.user?.profile?.full_name : "") ||
      "this applicant";
    setNotificationModal({
      isOpen: true,
      type: "confirm",
      title: "Approve KYC",
      message: `Are you sure you want to approve KYC for ${displayName}?`,
      action: "approve",
      item,
    });
  };

  // Handle reject
  const handleReject = (item: KYCQueueItem) => {
    const displayName =
      item.full_name ||
      (item.entityType === "member" ? item.user?.profile?.full_name : "") ||
      "this applicant";
    setReasonInput("");
    setNotificationModal({
      isOpen: true,
      type: "confirm",
      title: "Reject KYC",
      message: `Are you sure you want to reject KYC for ${displayName}? Please provide a reason.`,
      action: "reject",
      item,
    });
  };

  // Handle flag
  const handleFlag = (item: KYCQueueItem) => {
    const displayName =
      item.full_name ||
      (item.entityType === "member" ? item.user?.profile?.full_name : "") ||
      "this applicant";
    setReasonInput("");
    setNotificationModal({
      isOpen: true,
      type: "confirm",
      title: "Flag KYC for Review",
      message: `Flag KYC for ${displayName} for further review. Please provide a reason.`,
      action: "flag",
      item,
    });
  };

  // Execute action after confirmation
  const handleConfirmAction = async () => {
    const { action, item } = notificationModal;

    if (!item || !action) return;

    try {
      if (action === "approve") {
        await approveKYC(item.entityType, item.id);
        setNotificationModal({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "KYC approved successfully",
        });
      } else if (action === "reject") {
        if (!reasonInput.trim()) {
          return; // Should be blocked by disabled button, but just in case
        }
        await rejectKYC(item.entityType, item.id, reasonInput.trim());
        setNotificationModal({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "KYC rejected successfully",
        });
        setReasonInput("");
      } else if (action === "flag") {
        if (!reasonInput.trim()) {
          return; // Should be blocked by disabled button, but just in case
        }
        await flagKYC(item.entityType, item.id, reasonInput.trim());
        setNotificationModal({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "KYC flagged for review successfully",
        });
        setReasonInput("");
      }

      fetchQueue();
    } catch (err: any) {
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: err.response?.data?.error || `Failed to ${action} KYC`,
      });
    }
  };

  // Close notification modal
  const handleCloseNotification = () => {
    setNotificationModal({
      isOpen: false,
      type: "confirm",
      title: "",
      message: "",
    });
    setReasonInput("");
  };

  // Handle view - fetch and display entity details
  const handleView = async (item: KYCQueueItem) => {
    try {
      setLoadingEntity(true);
      const entityData = await getKYCById(item.entityType, item.id);
      setSelectedEntity(entityData);
      setEntityType(item.entityType);
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching entity details:", err);
      setNotificationModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: err.response?.data?.error || "Failed to load entity details",
      });
    } finally {
      setLoadingEntity(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntity(null);
    setEntityType(null);
  };

  // Handle member update
  const handleMemberUpdate = () => {
    fetchQueue();
  };

  return (
    <AdminLayout>
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
          <StatCard
            title="Pending Review"
            value={queue.filter((q) => q.kyc_status === "pending").length}
            icon={<FiClock className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Members"
            value={queue.filter((q) => q.entityType === "member").length}
            icon={<PiUsersThreeDuotone className="w-10 h-10" />}
          />
          <StatCard
            title="Agents"
            value={queue.filter((q) => q.entityType === "agent").length}
            icon={<PiUsersDuotone className="w-8 h-8" />}
            trend="neutral"
            trendValue=""
          />
          <StatCard
            title="Super Agents"
            value={queue.filter((q) => q.entityType === "super_agent").length}
            icon={<PiUserDuotone className="w-8 h-8" />}
          />
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
        <div className="bg-white rounded-2xl shadow-sm border  overflow-hidden">
          <DataTable
            columns={[
              {
                id: "type",
                header: "Type",
                cell: (row: KYCQueueItem) => getEntityBadge(row.entityType),
              },
              {
                id: "name",
                header: "Name",
                cell: (row: KYCQueueItem) =>
                  row.full_name ||
                  (row.entityType === "member"
                    ? row.user?.profile?.full_name
                    : "") ||
                  "N/A",
              },
              {
                id: "phone",
                header: "Phone",
                cell: (row: KYCQueueItem) => (
                  <span className="font-lexend font-semibold text-gray-500 tracking-wide">
                    {row.user?.phone || row.phone || "N/A"}
                  </span>
                ),
              },
              {
                id: "code",
                header: "Code/Account",
                cell: (row: KYCQueueItem) => (
                  <span className="font-lexend font- text-gray-600 tracking-wide">
                    {(row as any).code || (row as any).account_number || "N/A"}
                  </span>
                ),
              },
              {
                id: "submitted",
                header: "Submitted",
                cell: (row: KYCQueueItem) => (
                  <span className="font-lexend text-gray-600 tracking-wide">
                    {formatDate(row.created_at)}
                  </span>
                ),
              },
              {
                id: "documents",
                header: "Documents",
                cell: (row: KYCQueueItem) =>
                  `${row.kyc_documents?.length || 0} files`,
              },
              {
                id: "actions",
                header: "Actions",
                cell: (row: KYCQueueItem) => (
                  <div className="flex items-center justify-start gap-2">
                    <button
                      onClick={() => handleView(row)}
                      disabled={loadingEntity}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View Details"
                    >
                      <span className="underline underline-offset-4">
                        {loadingEntity ? "Loading..." : "View"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleApprove(row)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <span className="underline underline-offset-4">
                        Approve
                      </span>
                    </button>
                    <button
                      onClick={() => handleReject(row)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <span className="underline underline-offset-4">
                        Reject
                      </span>
                    </button>
                    <button
                      onClick={() => handleFlag(row)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Flag for Review"
                    >
                      <span className="underline underline-offset-4">Flag</span>
                    </button>
                  </div>
                ),
              },
            ]}
            rows={queue}
            totalItems={queue.length}
            startIndex={1}
            endIndex={queue.length}
            currentPage={1}
            totalPages={1}
            tableLoading={loading}
            hasSearched={false}
            getRowId={(row: KYCQueueItem) => `${row.entityType}-${row.id}`}
          />
        </div>

        {/* KYC Review Modal */}
        <KYCReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          kycItem={
            selectedEntity
              ? {
                  id:
                    selectedEntity.id ||
                    selectedEntity.agent_id ||
                    selectedEntity.user_id,
                  entityType: entityType || "member",
                  full_name:
                    selectedEntity.full_name ||
                    (entityType === "member"
                      ? selectedEntity.user?.profile?.full_name
                      : "") ||
                    "N/A",
                  phone:
                    selectedEntity.phone ||
                    selectedEntity.mpesa_phone ||
                    selectedEntity.user?.phone,
                  kyc_status: selectedEntity.kyc_status,
                  kyc_documents: selectedEntity.kyc_documents || [],
                  created_at: selectedEntity.created_at,
                  user: selectedEntity.user || {
                    phone: selectedEntity.phone,
                    profile: {
                      full_name: selectedEntity.full_name,
                    },
                  },
                  ...selectedEntity,
                }
              : null
          }
          onUpdate={handleMemberUpdate}
        />

        {/* Notification Modal for Actions */}
        <NotificationModal
          isOpen={notificationModal.isOpen}
          onClose={handleCloseNotification}
          type={notificationModal.type}
          title={notificationModal.title}
          message={notificationModal.message}
          confirmText={
            notificationModal.action === "approve"
              ? "Approve"
              : notificationModal.action === "reject"
                ? "Reject"
                : notificationModal.action === "flag"
                  ? "Flag"
                  : "Confirm"
          }
          cancelText="Cancel"
          onConfirm={
            notificationModal.type === "confirm"
              ? handleConfirmAction
              : handleCloseNotification
          }
          onCancel={handleCloseNotification}
          showCancel={notificationModal.type === "confirm"}
          autoClose={notificationModal.type === "success"}
          autoCloseDelay={3000}
          showInput={
            notificationModal.type === "confirm" &&
            (notificationModal.action === "reject" ||
              notificationModal.action === "flag")
          }
          inputPlaceholder={
            notificationModal.action === "reject"
              ? "Enter the reason for rejection..."
              : notificationModal.action === "flag"
                ? "Enter the reason for flagging..."
                : undefined
          }
          inputRequired={
            notificationModal.action === "reject" ||
            notificationModal.action === "flag"
          }
          inputValue={reasonInput}
          onInputChange={setReasonInput}
          inputType="textarea"
          inputRows={1}
        />
      </div>
    </AdminLayout>
  );
};

export default KYCManagement;
