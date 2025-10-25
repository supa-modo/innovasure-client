/**
 * AgentModal - Redesigned with vertical tabs and clean UI
 * Comprehensive agent management with inline editing
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import {
  PiUserDuotone,
  PiUsersDuotone,
  PiCurrencyDollarDuotone,
} from "react-icons/pi";
import { FiDollarSign, FiSettings } from "react-icons/fi";
import { TbUserStar } from "react-icons/tb";

import HorizontalTabs from "../shared/HorizontalTabs";
import EditableField from "../shared/EditableField";
import DocumentSection from "../shared/DocumentSection";
import SecuritySection from "../shared/SecuritySection";
import NotificationModal from "../ui/NotificationModal";

import { Agent } from "../../services/agentsService";
import {
  updateAgent,
  updateAgentKYC,
  toggleAgentStatus,
  resetAgentPassword,
  getAgentCommissionHistory,
} from "../../services/agentsService";
import { getMembersByAgent } from "../../services/membersService";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  onUpdate?: () => void;
}

const AgentModal: React.FC<AgentModalProps> = ({
  isOpen,
  onClose,
  agent,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [documents, setDocuments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [commissionsLoading, setCommissionsLoading] = useState(false);

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

  const tabs = [
    { id: "profile", label: "Profile", icon: <PiUserDuotone /> },
    { id: "members", label: "Members", icon: <PiUsersDuotone /> },
    {
      id: "commissions",
      label: "Commissions",
      icon: <PiCurrencyDollarDuotone />,
    },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ];

  // Load agent data when modal opens
  useEffect(() => {
    if (isOpen && agent) {
      loadAgentData();
    }
  }, [isOpen, agent]);

  const loadAgentData = async () => {
    if (!agent) return;

    try {
      // Load documents
      await loadDocuments();

      // Load members
      await loadMembers();

      // Load commissions
      await loadCommissions();
    } catch (error) {
      console.error("Error loading agent data:", error);
    }
  };

  const loadDocuments = async () => {
    if (!agent) return;

    setDocumentsLoading(true);
    try {
      // This would need to be implemented in the backend
      // For now, we'll use empty array
      setDocuments([]);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!agent) return;

    try {
      const agentMembers = await getMembersByAgent(agent.id);
      setMembers(agentMembers);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const loadCommissions = async () => {
    if (!agent) return;

    setCommissionsLoading(true);
    try {
      const data = await getAgentCommissionHistory(agent.id);
      setCommissions(data.commissions || []);
    } catch (error) {
      console.error("Error loading commissions:", error);
    } finally {
      setCommissionsLoading(false);
    }
  };

  const handleFieldUpdate = async (field: string, value: string | number) => {
    if (!agent) return;

    try {
      await updateAgent(agent.id, { [field]: value });
      onUpdate?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDocumentUpload = async (_files: File[]) => {
    if (!agent) return;

    try {
      // This would need to be implemented in the backend
      // For now, we'll show a placeholder
      throw new Error("Document upload not implemented yet");
    } catch (error: any) {
      throw error;
    }
  };

  const handleDocumentDelete = async (_key: string) => {
    if (!agent) return;

    try {
      // This would need to be implemented in the backend
      // For now, we'll show a placeholder
      throw new Error("Document delete not implemented yet");
    } catch (error: any) {
      throw error;
    }
  };

  const handlePasswordReset = async (_userId: string) => {
    if (!agent) return;

    try {
      const tempPassword = Math.random().toString(36).slice(-8);
      await resetAgentPassword(agent.id, tempPassword);
    } catch (error: any) {
      throw error;
    }
  };

  const handleStatusToggle = async (_userId: string, newStatus: string) => {
    if (!agent) return;

    try {
      await toggleAgentStatus(agent.id, newStatus as "active" | "inactive");
      onUpdate?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleKYCUpdate = async (_userId: string, status: string) => {
    if (!agent) return;

    try {
      await updateAgentKYC(agent.id, status);
      onUpdate?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPhoneNumber = (value: string | number) => {
    const phone = String(value);
    if (!phone) return "";
    return phone.startsWith("+254") ? phone : `+254${phone}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen || !agent) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] flex items-start justify-end z-50 p-3 font-lexend"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-[900px] h-[calc(100vh-20px)] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="px-6 py-4 relative border-b border-gray-200 dark:border-gray-700">
                <div className="relative flex justify-between items-center z-10">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <TbUserStar
                        size={32}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {agent.user?.profile?.full_name || "Agent"}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {agent.code}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900/20"
                    title="Close"
                  >
                    <FaXmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Horizontal Tabs */}
              <HorizontalTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Content */}
              <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-130px)]">
                <div className="overflow-y-auto flex-1">
                  <div className="p-6">
                    {activeTab === "profile" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Agent Profile
                        </h3>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EditableField
                            label="Full Name"
                            value={agent.user?.profile?.full_name || ""}
                            onSave={(value) =>
                              handleFieldUpdate("full_name", value)
                            }
                            required
                          />
                          <EditableField
                            label="Phone Number"
                            value={agent.user?.phone || ""}
                            type="tel"
                            onSave={(value) =>
                              handleFieldUpdate("phone", value)
                            }
                            format={formatPhoneNumber}
                            required
                          />
                          <EditableField
                            label="Email Address"
                            value={agent.user?.email || ""}
                            type="email"
                            onSave={(value) =>
                              handleFieldUpdate("email", value)
                            }
                          />
                          <EditableField
                            label="Agent Code"
                            value={agent.code}
                            disabled
                            onSave={async () => {}}
                          />
                        </div>

                        {/* Financial Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EditableField
                            label="M-Pesa Phone"
                            value={agent.user?.phone || ""}
                            type="tel"
                            onSave={(value) =>
                              handleFieldUpdate("phone", value)
                            }
                            format={formatPhoneNumber}
                          />
                          <EditableField
                            label="Bank Details"
                            value="Not available"
                            type="textarea"
                            onSave={(value) =>
                              handleFieldUpdate("bank_details", value)
                            }
                          />
                        </div>

                        {/* Super-Agent Assignment */}
                        {agent.super_agent && (
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <PiUsersDuotone className="w-5 h-5 mr-2 text-purple-600" />
                              Assigned Super-Agent
                            </h4>
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Super-Agent Name
                                  </label>
                                  <div className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600">
                                    {agent.super_agent.user?.profile
                                      ?.full_name || "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Super-Agent Code
                                  </label>
                                  <div className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 font-mono">
                                    {agent.super_agent.code}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Super-Agent Phone
                                  </label>
                                  <div className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600">
                                    {agent.super_agent.user?.phone || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Statistics */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                            Agent Statistics
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Total Members
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {agent.memberCount || 0}
                              </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Commission Balance
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                KSh{" "}
                                {(
                                  agent.commissionBalance || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Documents Section */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                          <DocumentSection
                            documents={documents}
                            onUpload={handleDocumentUpload}
                            onDelete={handleDocumentDelete}
                            onRefresh={loadDocuments}
                            loading={documentsLoading}
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "members" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Agent Members
                        </h3>

                        {members.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  Total Members
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {members.length}
                                </p>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  Active Members
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {
                                    members.filter(
                                      (m) => m.user?.status === "active"
                                    ).length
                                  }
                                </p>
                              </div>
                              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  Pending KYC
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {
                                    members.filter(
                                      (m) => m.kyc_status === "pending"
                                    ).length
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      Name
                                    </th>
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      Phone
                                    </th>
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      KYC Status
                                    </th>
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      Joined
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {members.map((member, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-100 dark:border-gray-700"
                                    >
                                      <td className="py-2 text-gray-900 dark:text-gray-300">
                                        {member.full_name}
                                      </td>
                                      <td className="py-2 text-gray-900 dark:text-gray-300">
                                        {member.phone}
                                      </td>
                                      <td className="py-2">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            member.kyc_status === "approved"
                                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                              : member.kyc_status === "pending"
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                : member.kyc_status ===
                                                    "rejected"
                                                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                          }`}
                                        >
                                          {member.kyc_status}
                                        </span>
                                      </td>
                                      <td className="py-2 text-gray-900 dark:text-gray-300">
                                        {formatDate(member.created_at)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <PiUsersDuotone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No members registered yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "commissions" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Commission Details
                        </h3>

                        {/* Commission Summary */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800">
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Commission Balance
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Current Balance
                              </p>
                              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                KSh{" "}
                                {(
                                  agent.commissionBalance || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Total Earned
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                KSh{" "}
                                {(
                                  agent.commissionBalance || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Commission History */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                            Commission History
                          </h4>
                          {commissionsLoading ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <p>Loading commission history...</p>
                            </div>
                          ) : commissions.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      Date
                                    </th>
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      Member
                                    </th>
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      Payment
                                    </th>
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      Commission
                                    </th>
                                    <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {commissions.map(
                                    (commission: any, index: number) => (
                                      <tr
                                        key={index}
                                        className="border-b border-gray-100 dark:border-gray-700"
                                      >
                                        <td className="py-2 text-gray-900 dark:text-gray-300">
                                          {formatDate(commission.date)}
                                        </td>
                                        <td className="py-2 text-gray-900 dark:text-gray-300">
                                          {commission.member_name}
                                        </td>
                                        <td className="py-2 text-gray-900 dark:text-gray-300">
                                          KSh{" "}
                                          {commission.payment_amount.toLocaleString()}
                                        </td>
                                        <td className="py-2 text-gray-900 dark:text-gray-300 font-semibold">
                                          KSh{" "}
                                          {commission.amount.toLocaleString()}
                                        </td>
                                        <td className="py-2">
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              commission.status === "disbursed"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                : commission.status ===
                                                    "pending"
                                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                            }`}
                                          >
                                            {commission.status}
                                          </span>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <FiDollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No commission history available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "settings" && (
                      <SecuritySection
                        userType="agent"
                        userId={agent.user?.id || agent.id}
                        userStatus={agent.user?.status || "active"}
                        kycStatus={agent.kyc_status}
                        onPasswordReset={handlePasswordReset}
                        onStatusToggle={handleStatusToggle}
                        onKYCUpdate={handleKYCUpdate}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 flex-shrink-0">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
};

export default AgentModal;
