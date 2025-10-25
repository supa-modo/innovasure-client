/**
 * Super Agent Details Modal
 * Comprehensive super-agent management with tabs
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrash2,
  FiKey,
} from "react-icons/fi";
import NotificationModal from "../ui/NotificationModal";
import { SuperAgent } from "../../services/superAgentsService";
import {
  updateSuperAgentKYC,
  toggleSuperAgentStatus,
  resetSuperAgentPassword,
} from "../../services/superAgentsService";

interface SuperAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  superAgent: SuperAgent | null;
  onUpdate?: () => void;
}

const SuperAgentModal = ({
  isOpen,
  onClose,
  superAgent,
  onUpdate,
}: SuperAgentModalProps) => {
  const [activeTab, setActiveTab] = useState("profile");

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

  const handleKYCAction = async (
    action: "approved" | "rejected" | "flagged"
  ) => {
    if (!superAgent) return;

    setNotification({
      isOpen: true,
      type: action === "approved" ? "confirm" : "warning",
      title:
        action === "approved"
          ? "Approve KYC"
          : action === "rejected"
            ? "Reject KYC"
            : "Flag KYC",
      message:
        action === "approved"
          ? "Are you sure you want to approve this super-agent's KYC?"
          : action === "rejected"
            ? "Please provide a reason for rejection."
            : "Please provide a reason for flagging.",
      onConfirm: async () => {
        try {
          await updateSuperAgentKYC(superAgent.id, action);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Updated",
            message: `Super-agent KYC has been ${action} successfully.`,
            onConfirm: undefined,
          });
          onUpdate?.();
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

  const handleToggleStatus = async () => {
    if (!superAgent) return;

    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Toggle Super-Agent Status",
      message: `Are you sure you want to ${superAgent.user?.status === "active" ? "deactivate" : "activate"} this super-agent?`,
      onConfirm: async () => {
        try {
          await toggleSuperAgentStatus(
            superAgent.id,
            superAgent.user?.status === "active" ? "inactive" : "active"
          );
          setNotification({
            isOpen: true,
            type: "success",
            title: "Status Updated",
            message: `Super-agent has been ${superAgent.user?.status === "active" ? "deactivated" : "activated"} successfully.`,
            onConfirm: undefined,
          });
          onUpdate?.();
        } catch (err: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Update Failed",
            message:
              err.response?.data?.error ||
              "Failed to update super-agent status.",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleResetPassword = async () => {
    if (!superAgent) return;

    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Reset Password",
      message:
        "Are you sure you want to reset this super-agent's password? A temporary password will be generated.",
      onConfirm: async () => {
        try {
          // Generate temporary password
          const tempPassword = Math.random().toString(36).slice(-8);
          await resetSuperAgentPassword(superAgent.id, tempPassword);
          setNotification({
            isOpen: true,
            type: "success",
            title: "Password Reset",
            message:
              "Super-agent password has been reset successfully. The new password has been sent to their email.",
            onConfirm: undefined,
          });
        } catch (err: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Reset Failed",
            message: err.response?.data?.error || "Failed to reset password.",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const getKYCBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      pending: {
        icon: FiXCircle,
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
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
      >
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  if (!isOpen || !superAgent) return null;

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "network", label: "Network" },
    { id: "agents", label: "Agents" },
    { id: "documents", label: "Documents" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[5px] flex items-center justify-center z-100000 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {superAgent.user?.profile?.full_name || "Super Agent"}
                    </h2>
                    <p className="text-purple-100 font-mono text-sm">
                      {superAgent.code}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors p-1"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  {getKYCBadge(superAgent.kyc_status)}
                  <span className="text-sm text-purple-100">
                    Joined{" "}
                    {new Date(superAgent.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex gap-1 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab.id
                          ? "text-purple-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-900">
                          {superAgent.user?.profile?.full_name || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <p className="text-gray-900">
                          {superAgent.user?.phone || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">
                          {superAgent.user?.email || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Network Statistics
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">
                            Total Agents
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {superAgent.agentCount || 0}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
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
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        KYC Management
                      </h3>
                      <div className="flex items-center gap-3">
                        {getKYCBadge(superAgent.kyc_status)}
                        {superAgent.kyc_status !== "approved" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleKYCAction("approved")}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleKYCAction("rejected")}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <FiXCircle className="w-4 h-4" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleKYCAction("flagged")}
                              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                              <FiAlertCircle className="w-4 h-4" />
                              Flag
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "network" && (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">
                      Network visualization coming soon
                    </p>
                  </div>
                )}

                {activeTab === "agents" && (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">
                      Agents list coming soon
                    </p>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">
                      Documents management coming soon
                    </p>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Super-Agent Status
                      </h3>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">Status</p>
                          <p className="text-sm text-gray-600">
                            {superAgent.user?.status || "active"}
                          </p>
                        </div>
                        <button
                          onClick={handleToggleStatus}
                          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                          {superAgent.user?.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Password Management
                      </h3>
                      <button
                        onClick={handleResetPassword}
                        className="w-full px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiKey className="w-4 h-4" />
                        Reset Password
                      </button>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-red-600 mb-4">
                        Danger Zone
                      </h3>
                      <button
                        onClick={() => {
                          setNotification({
                            isOpen: true,
                            type: "delete",
                            title: "Deactivate Super-Agent",
                            message:
                              "Are you sure you want to permanently deactivate this super-agent? This action cannot be undone.",
                            onConfirm: undefined,
                          });
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Deactivate Super-Agent
                      </button>
                    </div>
                  </div>
                )}
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
