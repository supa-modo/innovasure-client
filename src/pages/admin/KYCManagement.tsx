/**
 * KYC Management Page
 * Centralized KYC review queue
 */

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/ui/StatCard";
import MemberModal from "../../components/admin/MemberModal";
import {
  getKYCQueue,
  approveKYC,
  rejectKYC,
  flagKYC,
  getKYCById,
  KYCQueueItem,
  KYCFilters,
} from "../../services/kycService";
import { Member } from "../../services/membersService";
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
    status: "pending",
    page: 1,
    limit: 50,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loadingMember, setLoadingMember] = useState(false);

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

  // Handle view - fetch and display member details
  const handleView = async (item: KYCQueueItem) => {
    if (item.entityType !== "member") {
      alert("Member details are only available for member entities");
      return;
    }

    try {
      setLoadingMember(true);
      const memberData = await getKYCById("member", item.id);
      setSelectedMember(memberData as Member);
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching member details:", err);
      alert(err.response?.data?.error || "Failed to load member details");
    } finally {
      setLoadingMember(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
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
                  row.user?.profile?.full_name || row.full_name || "N/A",
              },
              {
                id: "phone",
                header: "Phone",
                cell: (row: KYCQueueItem) =>
                  <span className="font-lexend font-semibold text-gray-500 tracking-wide">{row.user?.phone || row.phone || "N/A"}</span>
                
              },
              {
                id: "code",
                header: "Code/Account",
                cell: (row: KYCQueueItem) =>
                  <span className="font-lexend font- text-gray-600 tracking-wide">{(row as any).code || (row as any).account_number || "N/A"}</span>
                
              },
              {
                id: "submitted",
                header: "Submitted",
                cell: (row: KYCQueueItem) =>
                  <span className="font-lexend text-gray-600 tracking-wide">{formatDate(row.created_at)}</span>
                
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
                      disabled={loadingMember}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View Details"
                    >
                      <span className="underline underline-offset-4">
                        {loadingMember ? "Loading..." : "View"}
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

        {/* Member Modal */}
        <MemberModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          member={selectedMember}
          onUpdate={handleMemberUpdate}
        />
      </div>
    </AdminLayout>
  );
};

export default KYCManagement;
