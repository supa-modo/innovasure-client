/**
 * SuperAgentModal - Redesigned with vertical tabs and clean UI
 * Comprehensive super-agent management with inline editing
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import {
  PiUserDuotone,
  PiUsersDuotone,
  PiCurrencyDollarDuotone,
} from "react-icons/pi";
import { FiShield, FiDollarSign, FiSettings } from "react-icons/fi";

import HorizontalTabs from "../shared/HorizontalTabs";
import EditableField from "../shared/EditableField";
import DocumentSection from "../shared/DocumentSection";
import SecuritySection from "../shared/SecuritySection";
import NotificationModal from "../ui/NotificationModal";

import { SuperAgent } from "../../services/superAgentsService";
import {
  updateSuperAgent,
  updateSuperAgentKYC,
  toggleSuperAgentStatus,
  resetSuperAgentPassword,
  getSuperAgentCommissionHistory,
  getAgentsBySuperAgent,
} from "../../services/superAgentsService";

interface SuperAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  superAgent: SuperAgent | null;
  onUpdate?: () => void;
}

const SuperAgentModal: React.FC<SuperAgentModalProps> = ({
  isOpen,
  onClose,
  superAgent,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [documents, setDocuments] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(false);
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
    { id: "personal", label: "Personal Info", icon: <PiUserDuotone /> },
    { id: "network", label: "Network Stats", icon: <FiShield /> },
    { id: "agents", label: "Agents List", icon: <PiUsersDuotone /> },
    {
      id: "commissions",
      label: "Commissions",
      icon: <PiCurrencyDollarDuotone />,
    },
    { id: "settings", label: "Account Settings", icon: <FiSettings /> },
  ];

  // Load super-agent data when modal opens
  useEffect(() => {
    if (isOpen && superAgent) {
      loadSuperAgentData();
    }
  }, [isOpen, superAgent]);

  const loadSuperAgentData = async () => {
    if (!superAgent) return;

    try {
      // Load documents
      await loadDocuments();

      // Load agents
      await loadAgents();

      // Load commissions
      await loadCommissions();
    } catch (error) {
      console.error("Error loading super-agent data:", error);
    }
  };

  const loadDocuments = async () => {
    if (!superAgent) return;

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

  const loadAgents = async () => {
    if (!superAgent) return;

    setAgentsLoading(true);
    try {
      const agentsList = await getAgentsBySuperAgent(superAgent.id);
      setAgents(agentsList || []);
    } catch (error) {
      console.error("Error loading agents:", error);
    } finally {
      setAgentsLoading(false);
    }
  };

  const loadCommissions = async () => {
    if (!superAgent) return;

    setCommissionsLoading(true);
    try {
      const data = await getSuperAgentCommissionHistory(superAgent.id);
      setCommissions(data.commissions || []);
    } catch (error) {
      console.error("Error loading commissions:", error);
    } finally {
      setCommissionsLoading(false);
    }
  };

  const handleFieldUpdate = async (field: string, value: string | number) => {
    if (!superAgent) return;

    try {
      await updateSuperAgent(superAgent.id, { [field]: value });
      onUpdate?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDocumentUpload = async (_files: File[]) => {
    if (!superAgent) return;

    try {
      // This would need to be implemented in the backend
      // For now, we'll show a placeholder
      throw new Error("Document upload not implemented yet");
    } catch (error: any) {
      throw error;
    }
  };

  const handleDocumentDelete = async (_key: string) => {
    if (!superAgent) return;

    try {
      // This would need to be implemented in the backend
      // For now, we'll show a placeholder
      throw new Error("Document delete not implemented yet");
    } catch (error: any) {
      throw error;
    }
  };

  const handlePasswordReset = async (_userId: string) => {
    if (!superAgent) return;

    try {
      const tempPassword = Math.random().toString(36).slice(-8);
      await resetSuperAgentPassword(superAgent.id, tempPassword);
    } catch (error: any) {
      throw error;
    }
  };

  const handleStatusToggle = async (_userId: string, newStatus: string) => {
    if (!superAgent) return;

    try {
      await toggleSuperAgentStatus(
        superAgent.id,
        newStatus as "active" | "inactive"
      );
      onUpdate?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleKYCUpdate = async (_userId: string, status: string) => {
    if (!superAgent) return;

    try {
      await updateSuperAgentKYC(superAgent.id, status);
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

  if (!isOpen || !superAgent) return null;

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
              className="w-[900px] h-[calc(100vh-20px)] bg-white shadow-2xl overflow-hidden rounded-3xl border border-gray-200"
            >
              {/* Header */}
              <div className="px-6 py-4 relative border-b border-gray-200">
                <div className="relative flex justify-between items-center z-10">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <PiUsersDuotone
                        size={32}
                        className="text-purple-600"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {superAgent.user?.profile?.full_name || "Super Agent"}
                      </h2>
                      <p className="text-sm text-gray-600">{superAgent.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-100"
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
                    {activeTab === "personal" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Personal Information
                        </h3>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EditableField
                            label="Full Name"
                            value={superAgent.user?.profile?.full_name || ""}
                            onSave={(value) =>
                              handleFieldUpdate("full_name", value)
                            }
                            required
                          />
                          <EditableField
                            label="Phone Number"
                            value={superAgent.user?.phone || ""}
                            type="tel"
                            onSave={(value) =>
                              handleFieldUpdate("phone", value)
                            }
                            format={formatPhoneNumber}
                            required
                          />
                          <EditableField
                            label="Email Address"
                            value={superAgent.user?.email || ""}
                            type="email"
                            onSave={(value) =>
                              handleFieldUpdate("email", value)
                            }
                          />
                          <EditableField
                            label="Super-Agent Code"
                            value={superAgent.code}
                            disabled
                            onSave={async () => {}}
                          />
                        </div>

                        {/* Financial Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EditableField
                            label="M-Pesa Phone"
                            value={superAgent.user?.phone || ""}
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

                        {/* Documents Section */}
                        <div className="border-t border-gray-200 pt-6">
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

                    {activeTab === "network" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Network Statistics
                        </h3>

                        {/* Network Overview */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">
                              Total Agents
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {superAgent.agentCount || 0}
                            </p>
                          </div>
                          <div className="bg-green-50  rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">
                              Total Members
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {superAgent.memberCount || 0}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">
                              Commission Balance
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              KSh{" "}
                              {(
                                superAgent.commissionBalance || 0
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 ">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              Active Network
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Active Agents
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {(superAgent as any).activeAgentCount || 0}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Active Members
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {(superAgent as any).activeMemberCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              Network Health
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Avg. Members/Agent
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {(superAgent as any).agentCount > 0
                                    ? Math.round(
                                        ((superAgent as any).memberCount || 0) /
                                          ((superAgent as any).agentCount || 1)
                                      )
                                    : 0}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Network Growth
                                </span>
                                <span className="font-semibold text-gray-900">
                                  +12%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "agents" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Network Agents
                        </h3>

                        {agentsLoading ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>Loading agents...</p>
                          </div>
                        ) : agents.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">
                                  Total Agents
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {agents.length}
                                </p>
                              </div>
                              <div className="bg-green-50  rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">
                                  Active Agents
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {
                                    agents.filter(
                                      (a) => a.user?.status === "active"
                                    ).length
                                  }
                                </p>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">
                                  Avg. Members
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {agents.length > 0
                                    ? Math.round(
                                        agents.reduce(
                                          (sum, a) =>
                                            sum + (a.memberCount || 0),
                                          0
                                        ) / agents.length
                                      )
                                    : 0}
                                </p>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-gray-700">
                                      Agent
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Code
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Members
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Commission
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {agents.map((agent, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-100"
                                    >
                                      <td className="py-2 text-gray-900">
                                        {agent.user?.profile?.full_name}
                                      </td>
                                      <td className="py-2 text-gray-900 font-mono">
                                        {agent.code}
                                      </td>
                                      <td className="py-2 text-gray-900">
                                        {agent.memberCount || 0}
                                      </td>
                                      <td className="py-2 text-gray-900">
                                        KSh{" "}
                                        {(
                                          agent.commissionBalance || 0
                                        ).toLocaleString()}
                                      </td>
                                      <td className="py-2">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            agent.user?.status === "active"
                                              ? "bg-green-100 text-green-800 "
                                              : "bg-red-100 text-red-800 "
                                          }`}
                                        >
                                          {agent.user?.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <PiUsersDuotone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No agents in network yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "commissions" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Commission Details
                        </h3>

                        {/* Commission Summary */}
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                          <h4 className="text-xl font-bold text-gray-900 mb-4">
                            Commission Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Current Balance
                              </p>
                              <p className="text-3xl font-bold text-gray-900">
                                KSh{" "}
                                {(
                                  superAgent.commissionBalance || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Total Earned
                              </p>
                              <p className="text-2xl font-bold text-gray-900">
                                KSh{" "}
                                {(
                                  (superAgent as any).totalCommissionEarned || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Commission Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">
                              This Month
                            </h5>
                            <p className="text-2xl font-bold text-gray-900">
                              KSh{" "}
                              {(
                                (superAgent as any).monthlyCommission || 0
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-green-50  rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">
                              Last Payout
                            </h5>
                            <p className="text-lg font-bold text-gray-900">
                              KSh{" "}
                              {(
                                (superAgent as any).lastPayoutAmount || 0
                              ).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">
                              {(superAgent as any).lastPayoutDate
                                ? formatDate((superAgent as any).lastPayoutDate)
                                : "No payouts yet"}
                            </p>
                          </div>
                        </div>

                        {/* Commission History */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">
                            Commission History
                          </h4>
                          {commissionsLoading ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>Loading commission history...</p>
                            </div>
                          ) : commissions.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-gray-700">
                                      Date
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Member
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Payment
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Commission
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {commissions.map(
                                    (commission: any, index: number) => (
                                      <tr
                                        key={index}
                                        className="border-b border-gray-100"
                                      >
                                        <td className="py-2 text-gray-900">
                                          {formatDate(commission.date)}
                                        </td>
                                        <td className="py-2 text-gray-900">
                                          {commission.member_name}
                                        </td>
                                        <td className="py-2 text-gray-900">
                                          KSh{" "}
                                          {commission.payment_amount.toLocaleString()}
                                        </td>
                                        <td className="py-2 text-gray-900 font-semibold">
                                          KSh{" "}
                                          {commission.amount.toLocaleString()}
                                        </td>
                                        <td className="py-2">
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              commission.status === "disbursed"
                                                ? "bg-green-100 text-green-800 "
                                                : commission.status ===
                                                    "pending"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800 "
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
                            <div className="text-center py-8 text-gray-500">
                              <FiDollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No commission history available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "settings" && (
                      <SecuritySection
                        userType="super_agent"
                        userId={superAgent.user?.id || superAgent.id}
                        userStatus={superAgent.user?.status || "active"}
                        kycStatus={superAgent.kyc_status}
                        onPasswordReset={handlePasswordReset}
                        onStatusToggle={handleStatusToggle}
                        onKYCUpdate={handleKYCUpdate}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-white px-6 py-4 flex-shrink-0">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold"
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

export default SuperAgentModal;
