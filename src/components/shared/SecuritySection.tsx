/**
 * SecuritySection Component
 * Reusable security controls section for modals
 */

import React, { useState } from "react";
import {
  FiKey,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiAlertCircle,
} from "react-icons/fi";
import NotificationModal from "../ui/NotificationModal";

interface SecuritySectionProps {
  userType: "member" | "agent" | "super_agent";
  userId: string;
  userStatus: string;
  kycStatus: string;
  onPasswordReset: (userId: string) => Promise<void>;
  onStatusToggle: (userId: string, newStatus: string) => Promise<void>;
  onKYCUpdate: (userId: string, status: string) => Promise<void>;
  className?: string;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  userType,
  userId,
  userStatus,
  kycStatus,
  onPasswordReset,
  onStatusToggle,
  onKYCUpdate,
  className = "",
}) => {
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

  const handlePasswordReset = () => {
    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Reset Password",
      message: `Are you sure you want to reset this ${userType}'s password? A temporary password will be generated and sent to their email.`,
      onConfirm: async () => {
        try {
          await onPasswordReset(userId);
          setNotification({
            isOpen: true,
            type: "success",
            title: "Password Reset",
            message:
              "Password has been reset successfully. The new password has been sent to their email.",
            onConfirm: undefined,
          });
        } catch (error: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Reset Failed",
            message: error.response?.data?.error || "Failed to reset password",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleStatusToggle = () => {
    const newStatus = userStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    setNotification({
      isOpen: true,
      type: "confirm",
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
      message: `Are you sure you want to ${action} this ${userType}?`,
      onConfirm: async () => {
        try {
          await onStatusToggle(userId, newStatus);
          setNotification({
            isOpen: true,
            type: "success",
            title: "Status Updated",
            message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} has been ${action}d successfully.`,
            onConfirm: undefined,
          });
        } catch (error: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Update Failed",
            message: error.response?.data?.error || "Failed to update status",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleKYCUpdate = (status: string) => {
    const action =
      status === "approved"
        ? "approve"
        : status === "rejected"
          ? "reject"
          : "flag";
    const actionText =
      action === "approve"
        ? "approve"
        : action === "reject"
          ? "reject"
          : "flag";

    setNotification({
      isOpen: true,
      type: status === "approved" ? "confirm" : "warning",
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} KYC`,
      message: `Are you sure you want to ${actionText} this ${userType}'s KYC?`,
      onConfirm: async () => {
        try {
          await onKYCUpdate(userId, status);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Updated",
            message: `KYC has been ${actionText}d successfully.`,
            onConfirm: undefined,
          });
        } catch (error: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Update Failed",
            message:
              error.response?.data?.error || "Failed to update KYC status",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const getKYCBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      pending: {
        icon: FiAlertCircle,
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        text: "Pending",
      },
      under_review: {
        icon: FiAlertCircle,
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        text: "Under Review",
      },
      approved: {
        icon: FiUserCheck,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        text: "Approved",
      },
      rejected: {
        icon: FiUserX,
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        text: "Rejected",
      },
      flagged: {
        icon: FiAlertCircle,
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
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

  const getStatusBadge = (status: string) => {
    const isActive = status === "active";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isActive
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-green-500" : "bg-red-500"}`}
        />
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiShield className="w-5 h-5 mr-2 text-blue-600" />
          Security & Account Management
        </h3>

        {/* Account Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Account Status
          </h4>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              {getStatusBadge(userStatus)}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {userStatus === "active"
                  ? "Account is active and accessible"
                  : "Account is inactive and restricted"}
              </span>
            </div>
            <button
              onClick={handleStatusToggle}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                userStatus === "active"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {userStatus === "active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        {/* KYC Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            KYC Status
          </h4>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              {getKYCBadge(kycStatus)}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {kycStatus === "approved"
                  ? "Identity verified and approved"
                  : kycStatus === "rejected"
                    ? "Identity verification rejected"
                    : kycStatus === "flagged"
                      ? "Identity verification flagged for review"
                      : "Identity verification pending"}
              </span>
            </div>
            {kycStatus !== "approved" && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleKYCUpdate("approved")}
                  className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleKYCUpdate("rejected")}
                  className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleKYCUpdate("flagged")}
                  className="px-3 py-1 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Flag
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Password Management */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password Management
          </h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiKey className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Reset Password
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Generate a new temporary password
                  </p>
                </div>
              </div>
              <button
                onClick={handlePasswordReset}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
            Danger Zone
          </h4>
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Delete {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  This action cannot be undone. All data will be permanently
                  deleted.
                </p>
              </div>
              <button
                onClick={() => {
                  setNotification({
                    isOpen: true,
                    type: "delete",
                    title: `Delete ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
                    message: `Are you sure you want to permanently delete this ${userType}? This action cannot be undone.`,
                    onConfirm: undefined,
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

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

export default SecuritySection;
