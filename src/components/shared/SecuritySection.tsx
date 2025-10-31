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
  onKYCUpdate: (userId: string, status: string, reason?: string) => Promise<void>;
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
    showInput: false,
    inputLabel: "",
    inputPlaceholder: "",
    inputRequired: false,
    inputValue: "",
    onInputChange: undefined as ((value: string) => void) | undefined,
    inputType: "text" as "text" | "textarea",
  });
  const [reasonInput, setReasonInput] = useState("");

  const handlePasswordReset = () => {
    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Reset Password",
      message: `Are you sure you want to reset this ${userType}'s password? A temporary password will be generated and sent to their email.`,
      showInput: false,
      inputLabel: "",
      inputPlaceholder: "",
      inputRequired: false,
      inputValue: "",
      onInputChange: undefined,
      inputType: "text",
      onConfirm: async () => {
        try {
          await onPasswordReset(userId);
          // Success notification will be shown by parent component with temp password
        } catch (error: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Reset Failed",
            message: error.response?.data?.error || "Failed to reset password",
            onConfirm: undefined,
            showInput: false,
            inputLabel: "",
            inputPlaceholder: "",
            inputRequired: false,
            inputValue: "",
            onInputChange: undefined,
            inputType: "text",
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
      showInput: false,
      inputLabel: "",
      inputPlaceholder: "",
      inputRequired: false,
      inputValue: "",
      onInputChange: undefined,
      inputType: "text",
      onConfirm: async () => {
        try {
          await onStatusToggle(userId, newStatus);
          setNotification({
            isOpen: true,
            type: "success",
            title: "Status Updated",
            message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} has been ${action}d successfully.`,
            onConfirm: undefined,
            showInput: false,
            inputLabel: "",
            inputPlaceholder: "",
            inputRequired: false,
            inputValue: "",
            onInputChange: undefined,
            inputType: "text",
          });
        } catch (error: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Update Failed",
            message: error.response?.data?.error || "Failed to update status",
            onConfirm: undefined,
            showInput: false,
            inputLabel: "",
            inputPlaceholder: "",
            inputRequired: false,
            inputValue: "",
            onInputChange: undefined,
            inputType: "text",
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

    // If rejecting or flagging, ask for reason
    if (status === "rejected" || status === "flagged") {
      setReasonInput(""); // Reset reason input
      setNotification({
        isOpen: true,
        type: status === "rejected" ? "error" : "warning",
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} KYC`,
        message: `Please provide a reason for ${actionText === "reject" ? "rejecting" : "flagging"} this ${userType}'s KYC:`,
        showInput: true,
        inputLabel: "Reason",
        inputPlaceholder: `Enter reason for ${actionText === "reject" ? "rejection" : "flagging"}`,
        inputRequired: true,
        inputType: "textarea",
        inputValue: reasonInput,
        onInputChange: (value: string) => setReasonInput(value),
        onConfirm: async () => {
          if (!reasonInput.trim()) return; // Don't proceed if reason is empty
          try {
            await onKYCUpdate(userId, status, reasonInput);
            setReasonInput(""); // Clear after success
            setNotification({
              isOpen: true,
              type: "success",
              title: "KYC Updated",
              message: `KYC has been ${actionText}d successfully.`,
              onConfirm: undefined,
              showInput: false,
              inputLabel: "",
              inputPlaceholder: "",
              inputRequired: false,
              inputValue: "",
              onInputChange: undefined,
              inputType: "text",
            });
          } catch (error: any) {
            setNotification({
              isOpen: true,
              type: "error",
              title: "Update Failed",
              message:
                error.response?.data?.error || "Failed to update KYC status",
              onConfirm: undefined,
              showInput: false,
              inputLabel: "",
              inputPlaceholder: "",
              inputRequired: false,
              inputValue: "",
              onInputChange: undefined,
              inputType: "text",
            });
          }
        },
      });
    } else {
      // For approval, no reason needed
      setNotification({
        isOpen: true,
        type: "confirm",
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} KYC`,
        message: `Are you sure you want to ${actionText} this ${userType}'s KYC?`,
        showInput: false,
        inputLabel: "",
        inputPlaceholder: "",
        inputRequired: false,
        inputValue: "",
        onInputChange: undefined,
        inputType: "text",
        onConfirm: async () => {
          try {
            await onKYCUpdate(userId, status);
            setNotification({
              isOpen: true,
              type: "success",
              title: "KYC Updated",
              message: `KYC has been ${actionText}d successfully.`,
              onConfirm: undefined,
              showInput: false,
              inputLabel: "",
              inputPlaceholder: "",
              inputRequired: false,
              inputValue: "",
              onInputChange: undefined,
              inputType: "text",
            });
          } catch (error: any) {
            setNotification({
              isOpen: true,
              type: "error",
              title: "Update Failed",
              message:
                error.response?.data?.error || "Failed to update KYC status",
              onConfirm: undefined,
              showInput: false,
              inputLabel: "",
              inputPlaceholder: "",
              inputRequired: false,
              inputValue: "",
              onInputChange: undefined,
              inputType: "text",
            });
          }
        },
      });
    }
  };

  const getKYCBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      pending: {
        icon: FiAlertCircle,
        color:
          "bg-yellow-100 text-yellow-800",
        text: "Pending",
      },
      under_review: {
        icon: FiAlertCircle,
        color: "bg-blue-100 text-blue-800 ",
        text: "Under Review",
      },
      approved: {
        icon: FiUserCheck,
        color: "bg-green-100 text-green-800 ",
        text: "Approved",
      },
      rejected: {
        icon: FiUserX,
        color: "bg-red-100 text-red-800 ",
        text: "Rejected",
      },
      flagged: {
        icon: FiAlertCircle,
        color:
          "bg-orange-100 text-orange-800",
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
            ? "bg-green-100 text-green-800 "
            : "bg-red-100 text-red-800 "
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
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiShield className="w-5 h-5 mr-2 text-blue-600" />
          Security & Account Management
        </h3>

        {/* Account Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Account Status</h4>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              {getStatusBadge(userStatus)}
              <span className="text-sm text-gray-600">
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
          <h4 className="text-sm font-medium text-gray-700">KYC Status</h4>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              {getKYCBadge(kycStatus)}
              <span className="text-sm text-gray-600">
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
          <h4 className="text-sm font-medium text-gray-700">
            Password Management
          </h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiKey className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Reset Password
                  </p>
                  <p className="text-xs text-gray-600">
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

        {/* Danger Zone - Disabled (No delete endpoint) */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-600">
            Account Management
          </h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Delete {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </p>
                <p className="text-xs text-gray-600">
                  Account deletion is not available. Use account deactivation instead.
                </p>
              </div>
              <button
                disabled
                className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
              >
                Delete (Disabled)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => {
          setReasonInput("");
          setNotification({ ...notification, isOpen: false });
        }}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        showCancel={notification.type === "confirm" || notification.type === "delete"}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
        showInput={notification.showInput}
        inputLabel={notification.inputLabel}
        inputPlaceholder={notification.inputPlaceholder}
        inputRequired={notification.inputRequired}
        inputValue={notification.inputValue}
        onInputChange={notification.onInputChange}
        inputType={notification.inputType}
      />
    </>
  );
};

export default SecuritySection;
