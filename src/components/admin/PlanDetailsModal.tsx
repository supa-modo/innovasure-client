import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiX as FiXIcon, FiSearch } from "react-icons/fi";
import { TbRefresh } from "react-icons/tb";
import { PiUsersDuotone } from "react-icons/pi";
import { InsurancePlan } from "../../services/insurancePlansService";
import api from "../../services/api";

interface Subscriber {
  id: string;
  status: string;
  subscriptionDate: string;
  effectiveDate: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  agentName?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InsurancePlan | null;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [subscribersPerPage] = useState(10);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    if (isOpen && plan) {
      fetchSubscribers();
    }
  }, [isOpen, plan]);

  const fetchSubscribers = async () => {
    if (!plan) return;

    setLoading(true);
    try {
      const response = await api.get(`/subscriptions`, {
        params: { plan_id: plan.id, limit: 1000 },
      });

      if (response.data && response.data.subscriptions) {
        const mappedSubscribers = response.data.subscriptions.map(
          (sub: any) => {
            const member = sub.member || {};
            const agent = member.agent || {};
            const agentUser = agent.user || {};

            // Extract name from member's full_name
            let firstName = "Unknown";
            let lastName = "User";

            if (member.full_name) {
              const nameParts = member.full_name.split(" ");
              if (nameParts.length > 0) {
                firstName = nameParts[0];
                lastName = nameParts.slice(1).join(" ") || "User";
              }
            }

            // Extract agent name from user profile
            let agentName = "No Agent";
            if (agentUser && agentUser.profile) {
              const profile = agentUser.profile;
              // Try full_name first, then first_name + last_name
              if (profile.full_name) {
                agentName = profile.full_name;
              } else {
                const agentFirstName =
                  profile.firstName || profile.first_name || "";
                const agentLastName =
                  profile.lastName || profile.last_name || "";
                if (agentFirstName || agentLastName) {
                  agentName = `${agentFirstName} ${agentLastName}`.trim();
                }
              }
            }

            return {
              id: sub.id,
              status: sub.status,
              subscriptionDate: sub.start_date || sub.created_at,
              effectiveDate: sub.start_date,
              user: {
                id: member.user_id || member.id || "N/A",
                firstName,
                lastName,
                email: member.email || "N/A",
                phoneNumber: member.phone || "N/A",
              },
              agentName: agentName || "No Agent",
              createdAt: sub.created_at,
              updatedAt: sub.updated_at,
            };
          }
        );

        setSubscribers(mappedSubscribers);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      !searchTerm ||
      subscriber.user?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscriber.user?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      subscriber.user?.phoneNumber?.includes(searchTerm) ||
      subscriber.agentName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || subscriber.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);
  const startIndex = (currentPage - 1) * subscribersPerPage;
  const endIndex = startIndex + subscribersPerPage;
  const currentSubscribers = filteredSubscribers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      active:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700 rounded-full",
      pending:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 rounded-full",
      suspended:
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 rounded-full",
      cancelled:
        "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-full",
      expired:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700 rounded-full",
      inactive:
        "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-full",
    };

    return (
      statusConfig[status.toLowerCase()] ||
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 rounded-full"
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateCommission = (
    amount: number,
    type: "fixed" | "percent",
    value: number
  ): number => {
    if (type === "fixed") {
      return value;
    }
    return (amount * value) / 100;
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!plan) return null;

  // Calculate commission allocations
  const premium = plan.premium_amount || 0;
  const portions = plan.portions || {
    agent_commission: { type: "fixed" as const, value: 0 },
    super_agent_commission: { type: "fixed" as const, value: 0 },
    insurance_share: { type: "fixed" as const, value: 0 },
    admin_share: { type: "fixed" as const, value: 0 },
  };

  const agentComm = calculateCommission(
    premium,
    portions.agent_commission.type,
    portions.agent_commission.value
  );
  const superAgentComm = calculateCommission(
    premium,
    portions.super_agent_commission.type,
    portions.super_agent_commission.value
  );
  const insuranceShare = calculateCommission(
    premium,
    portions.insurance_share.type,
    portions.insurance_share.value
  );
  const adminShare = premium - agentComm - superAgentComm - insuranceShare;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] flex items-start justify-end z-50 p-3 font-lexend"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-[65%] h-[calc(100vh-20px)] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex h-full">
                {/* Left Panel - Plan Details */}
                <div className="w-[45%] border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* Insurance Plan Details */}
                    <div className="bg-white dark:bg-gray-800 p-3">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-secondary-600 dark:text-secondary-500">
                          {plan.name}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-medium border ${getStatusBadge(
                            plan.is_active ? "active" : "inactive"
                          )}`}
                        >
                          {plan.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-sans text-gray-500 dark:text-gray-400">
                              Premium Amount
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-700 dark:text-white">
                            {formatCurrency(premium)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-sans text-gray-500 dark:text-gray-400">
                              Frequency
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-700 dark:text-white capitalize">
                            {plan.premium_frequency}
                          </p>
                        </div>
                      </div>

                      {/* Commission Breakdown */}
                      <div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-sans text-gray-600 dark:text-gray-400">
                                Agent Commission
                              </span>
                            </div>
                            <p className="text-base font-bold text-gray-700 dark:text-white">
                              {formatCurrency(agentComm)}
                            </p>
                            <p className="text-xs font-sans text-gray-500 dark:text-gray-400">
                              {premium > 0
                                ? ((agentComm / premium) * 100).toFixed(1)
                                : 0}
                              % of total
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-sans text-gray-600 dark:text-gray-400">
                                Super Agent
                              </span>
                            </div>
                            <p className="text-base font-bold text-gray-700 dark:text-white">
                              {formatCurrency(superAgentComm)}
                            </p>
                            <p className="text-xs font-sans text-gray-500 dark:text-gray-400">
                              {premium > 0
                                ? ((superAgentComm / premium) * 100).toFixed(1)
                                : 0}
                              % of total
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-sans text-gray-600 dark:text-gray-400">
                                Insurance Share
                              </span>
                            </div>
                            <p className="text-base font-bold text-gray-700 dark:text-white">
                              {formatCurrency(insuranceShare)}
                            </p>
                            <p className="text-xs font-sans text-gray-500 dark:text-gray-400">
                              {premium > 0
                                ? ((insuranceShare / premium) * 100).toFixed(1)
                                : 0}
                              % of total
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-sans text-gray-600 dark:text-gray-400">
                                Admin Share
                              </span>
                            </div>
                            <p className="text-base font-bold text-gray-700 dark:text-white">
                              {formatCurrency(adminShare)}
                            </p>
                            <p className="text-xs font-sans text-gray-500 dark:text-gray-400">
                              {premium > 0
                                ? ((adminShare / premium) * 100).toFixed(1)
                                : 0}
                              % of total
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Coverage Amount */}
                      <div className="mt-6">
                        <div className="space-y-2">
                          <span className="text-sm font-sans text-gray-500 dark:text-gray-400">
                            Coverage Amount
                          </span>
                          <p className="text-lg font-bold text-gray-700 dark:text-white">
                            {formatCurrency(plan.coverage_amount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                        <h3 className="font-bold text-gray-600 dark:text-gray-200 mb-3">
                          Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {plan.description}
                        </p>
                      </div>
                    )}

                    {/* Benefits */}
                    {plan.coverage_details?.benefits &&
                      plan.coverage_details.benefits.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-700">
                          <h3 className="font-bold text-green-800 dark:text-green-200 mb-4">
                            Benefits
                          </h3>
                          <div className="space-y-2">
                            {plan.coverage_details.benefits.map(
                              (benefit, index) => (
                                <div
                                  key={index}
                                  className="flex items-center px-2"
                                >
                                  <FiCheck className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                                  <span className="text-sm text-green-800 dark:text-green-200">
                                    {benefit}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Limitations */}
                    {plan.coverage_details?.limitations &&
                      plan.coverage_details.limitations.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-700">
                          <h3 className="font-bold text-red-800 dark:text-red-200 mb-4">
                            Limitations & Exclusions
                          </h3>
                          <div className="space-y-2">
                            {plan.coverage_details.limitations.map(
                              (limitation, index) => (
                                <div
                                  key={index}
                                  className="flex items-center px-2"
                                >
                                  <FiXIcon className="w-4 h-4 text-red-600 mr-3 flex-shrink-0" />
                                  <span className="text-sm text-red-800 dark:text-red-200">
                                    {limitation}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Right Side - Subscribers */}
                <div className="w-[55%] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 flex items-center">
                        <PiUsersDuotone className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                        Subscribers ({filteredSubscribers.length})
                        {subscribers.length > 0 && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
                            of {subscribers.length} total
                          </span>
                        )}
                        {totalPages > 1 && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
                            • Page {currentPage} of {totalPages}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={fetchSubscribers}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Refresh subscribers"
                        >
                          <TbRefresh className="w-5 h-5" />
                        </button>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="suspended">Suspended</option>
                          <option value="inactive">Inactive</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search subscribers by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>

                    {/* Subscribers List */}
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-3">
                          Loading subscribers...
                        </p>
                      </div>
                    ) : filteredSubscribers.length === 0 ? (
                      <div className="text-center py-12">
                        <PiUsersDuotone className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          No subscribers found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {searchTerm || filterStatus !== "all"
                            ? "No subscribers match your search criteria"
                            : "No subscribers found for this plan"}
                        </p>
                      </div>
                    ) : (
                      <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden p-1.5">
                        {currentSubscribers.map((subscriber, index) => (
                          <div
                            key={subscriber.id}
                            className="py-2 px-2 border-b border-gray-300 dark:border-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    {startIndex + index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-secondary-600 dark:text-white">
                                    {subscriber.user?.firstName || "Unknown"}{" "}
                                    {subscriber.user?.lastName || "User"}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-[0.8rem] text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center font-semibold space-x-1">
                                      <span>
                                        {subscriber.user?.phoneNumber || "N/A"}
                                      </span>
                                    </div>
                                    {subscriber.agentName && (
                                      <div className="flex items-center space-x-1">
                                        <span>{subscriber.agentName}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-2">
                                <span
                                  className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                                    subscriber.status
                                  )}`}
                                >
                                  {subscriber.status?.charAt(0).toUpperCase() +
                                    subscriber.status?.slice(1) || "Unknown"}
                                </span>
                                <div className="text-[0.7rem] font-sans text-gray-500 dark:text-gray-400">
                                  Since{" "}
                                  {formatDate(
                                    subscriber.subscriptionDate ||
                                      subscriber.createdAt
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(endIndex, filteredSubscribers.length)} of{" "}
                          {filteredSubscribers.length} subscribers
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>

                          <div className="flex items-center space-x-1">
                            {Array.from(
                              { length: Math.min(5, totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }

                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                      currentPage === pageNum
                                        ? "bg-primary-600 text-white"
                                        : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          <button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-4 flex-shrink-0">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-[0.6rem] text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanDetailsModal;
